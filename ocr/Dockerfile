# Upgrade to Python 3.10 to support newer libraries
FROM python:3.10-slim

# Install system dependencies
# "libgl1" is correct for Debian 12 (Bookworm) which python:3.10-slim uses
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download OCR models
RUN python3 -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='en')"

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]