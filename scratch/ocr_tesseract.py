import pytesseract
from PIL import Image
import sys

img_path = r"E:\desenvolvimento\Reformasemerro\audios\audio_novo\new\WhatsApp Image 2026-06-05 at 19.45.51.jpeg"
print("Running PyTesseract OCR on", img_path)

try:
    text = pytesseract.image_to_string(Image.open(img_path), lang='por')
    print("SUCCESS TESSERACT:")
    print(text)
except Exception as e:
    print("Error with Tesseract language 'por':", e)
    try:
        text = pytesseract.image_to_string(Image.open(img_path))
        print("SUCCESS TESSERACT (DEFAULT LANG):")
        print(text)
    except Exception as e2:
        print("Error with default Tesseract:", e2)
