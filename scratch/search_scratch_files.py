import os

scratch_dir = "E:\\desenvolvimento\\Reformasemerro\\scratch"
files = ["context.txt", "transcript_search.txt", "transcript_range.txt", "assets_info.txt"]

for f in files:
    path = os.path.join(scratch_dir, f)
    if not os.path.exists(path):
        continue
    print(f"=== Search in {f} ===")
    with open(path, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            if any(kw in line.lower() for kw in ["whatsapp image", "planejar", "prevenir", "proteger", "decidir", "sub-view"]):
                safe_line = line.encode('ascii', errors='replace').decode('ascii')
                print(f"Line {idx+1}: {safe_line[:120]}")
    print("-" * 50)
