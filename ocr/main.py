from fastapi import FastAPI, UploadFile, File, HTTPException
from paddleocr import PaddleOCR
from pdf2image import convert_from_path
import docx
import openpyxl
import shutil
import os

app = FastAPI()

# Initialize PaddleOCR
ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

def extract_from_image(image_path):
    result = ocr_engine.ocr(image_path, cls=True)
    text = ""
    if result and result[0]:
        text = "\n".join([line[1][0] for line in result[0]])
    return text

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    filename = file.filename.lower()
    temp_file = f"temp_{file.filename}"
    
    # Save uploaded file
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    full_text = ""

    try:
        # 1. Handle PDF (Convert to images first to handle scans)
        if filename.endswith(".pdf"):
            try:
                # Convert PDF to images (300 DPI for better OCR)
                images = convert_from_path(temp_file, dpi=300)
                
                for i, image in enumerate(images):
                    # Save page as temp image
                    page_path = f"{temp_file}_page_{i}.jpg"
                    image.save(page_path, "JPEG")
                    
                    # OCR the page
                    page_text = extract_from_image(page_path)
                    full_text += f"\n--- Page {i+1} ---\n{page_text}"
                    
                    if os.path.exists(page_path):
                        os.remove(page_path)
            except Exception as e:
                full_text = f"Error processing PDF: {str(e)}"

        # 2. Handle Word (.docx)
        elif filename.endswith(".docx"):
            try:
                doc = docx.Document(temp_file)
                full_text = "\n".join([para.text for para in doc.paragraphs])
            except Exception as e:
                full_text = f"Error processing Word doc: {str(e)}"

        # 3. Handle Excel (.xlsx)
        elif filename.endswith(".xlsx"):
            try:
                wb = openpyxl.load_workbook(temp_file)
                for sheet in wb.sheetnames:
                    ws = wb[sheet]
                    full_text += f"\n--- Sheet: {sheet} ---\n"
                    for row in ws.iter_rows(values_only=True):
                        # Join cells with spaces, ignoring None
                        row_text = " ".join([str(cell) for cell in row if cell])
                        full_text += row_text + "\n"
            except Exception as e:
                full_text = f"Error processing Excel: {str(e)}"

        # 4. Handle Images (jpg, png, etc.)
        else:
            # Assume image
            full_text = extract_from_image(temp_file)
        
        return {"text": full_text.strip()}
        
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)