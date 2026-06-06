from PIL import Image
import os

images = [
    r"E:\desenvolvimento\Reformasemerro\audios\audio_novo\new\WhatsApp Image 2026-06-05 at 12.00.11.jpeg",
    r"E:\desenvolvimento\Reformasemerro\audios\audio_novo\new\WhatsApp Image 2026-06-05 at 19.29.47.jpeg"
]

for img_path in images:
    if not os.path.exists(img_path):
        print(f"Not found: {img_path}")
        continue
    with Image.open(img_path) as img:
        print(f"Path: {os.path.basename(img_path)}")
        print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
        # Get thumbnail or top left pixels
        pixels = list(img.resize((10, 10)).getdata())
        print(f"Resize 10x10 colors: {pixels[:5]}...")
        # Check standard deviation of colors
        # and see if there are black or white margins
        # Let's count some properties
        extrema = img.getextrema()
        print(f"Extrema: {extrema}")
