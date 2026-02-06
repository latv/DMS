from fastapi import FastAPI, UploadFile, File, HTTPException
from paddleocr import PaddleOCR
from pdf2image import convert_from_path
import docx
import openpyxl
import shutil
import os
import uvicorn

app = FastAPI()

# Initialize PaddleOCR
# Note: This downloads models on first run if not present in the image
ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

def extract_from_image(image_path):
    result = ocr_engine.ocr(image_path, cls=True)
    text = ""
    if result and result[0]:
        text = "\n".join([line[1][0] for line in result[0]])
    return text

@app.get("/")
async def root():
    return {"status": "OCR Service is running"}

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    filename = file.filename.lower()
    temp_file = f"temp_{file.filename}"
    
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    full_text = ""

    try:
        if filename.endswith(".pdf"):
            images = convert_from_path(temp_file, dpi=300)
            for i, image in enumerate(images):
                page_path = f"{temp_file}_page_{i}.jpg"
                image.save(page_path, "JPEG")
                page_text = extract_from_image(page_path)
                full_text += f"\n--- Page {i+1} ---\n{page_text}"
                if os.path.exists(page_path):
                    os.remove(page_path)

        elif filename.endswith(".docx"):
            doc = docx.Document(temp_file)
            full_text = "\n".join([para.text for para in doc.paragraphs])

        elif filename.endswith(".xlsx"):
            wb = openpyxl.load_workbook(temp_file)
            for sheet in wb.sheetnames:
                ws = wb[sheet]
                full_text += f"\n--- Sheet: {sheet} ---\n"
                for row in ws.iter_rows(values_only=True):
                    row_text = " ".join([str(cell) for cell in row if cell])
                    full_text += row_text + "\n"
        else:
            full_text = extract_from_image(temp_file)
        
        return {"text": full_text.strip()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == "__main__":
    # CRITICAL: host must be 0.0.0.0 for Docker
    uvicorn.run(app, host="0.0.0.0", port=8000)