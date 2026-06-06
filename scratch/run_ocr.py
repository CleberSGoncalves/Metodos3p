import easyocr
import os

print("Initializing EasyOCR reader for Portuguese and English...")
try:
    reader = easyocr.Reader(['pt', 'en'], gpu=False)
    print("Reader initialized successfully.")
except Exception as e:
    print("Error initializing EasyOCR reader:", e)
    reader = None

paths = [
    r"E:\desenvolvimento\Reformasemerro\audios\audio_novo\new",
    r"E:\desenvolvimento\Reformasemerro\audios\audio_novo\new\extracted_1",
    r"E:\desenvolvimento\Reformasemerro\audios\audio_novo\new\extracted_2"
]

out_file = r"E:\desenvolvimento\Reformasemerro\scratch\ocr_results.txt"

with open(out_file, "w", encoding="utf-8") as out:
    out.write("=== OCR RESULTS ===\n\n")
    
    if reader is None:
        out.write("Failed to initialize EasyOCR reader.\n")
        exit(1)

    for p in paths:
        if not os.path.exists(p):
            out.write(f"Path does not exist: {p}\n")
            continue
            
        out.write(f"=== Directory: {p} ===\n")
        print(f"Processing directory: {p}")
        
        for f in os.listdir(p):
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                full_path = os.path.join(p, f)
                out.write(f"--- File: {f} ---\n")
                print(f"  Running OCR on {f}...")
                try:
                    results = reader.readtext(full_path, detail=0)
                    for text in results:
                        out.write(f"  {text}\n")
                except Exception as e:
                    out.write(f"  Error processing: {e}\n")
                out.write("\n" + "="*40 + "\n\n")

print("OCR run completed. Results saved to:", out_file)
