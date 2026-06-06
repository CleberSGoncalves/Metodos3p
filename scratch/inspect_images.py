import os
from PIL import Image

paths = [
    r"e:\desenvolvimento\Reformasemerro\audios\audio_novo\new",
    r"e:\desenvolvimento\Reformasemerro\audios\audio_novo\new\extracted_1",
    r"e:\desenvolvimento\Reformasemerro\audios\audio_novo\new\extracted_2"
]

for p in paths:
    if not os.path.exists(p):
        print(f"Path does not exist: {p}")
        continue
    print(f"=== Directory: {p} ===")
    for f in os.listdir(p):
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            full_path = os.path.join(p, f)
            try:
                with Image.open(full_path) as img:
                    print(f"File: {f} | Size: {os.path.getsize(full_path)} bytes | Format: {img.format} | Mode: {img.mode} | Dimensions: {img.size} (aspect {img.size[0]/img.size[1]:.2f})")
            except Exception as e:
                print(f"Error reading {f}: {e}")
