import sys
import io

# Set stdout to UTF-8 to prevent encoding errors on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

lines_to_inspect = [352, 1180, 1397, 1738, 1747, 1980, 2532, 3240]

with open("e:/desenvolvimento/Reformasemerro/index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for line_num in lines_to_inspect:
    print(f"\n--- Line {line_num} ---")
    start = max(0, line_num - 5)
    end = min(len(lines), line_num + 5)
    for i in range(start, end):
        prefix = "-> " if i + 1 == line_num else "   "
        if i < len(lines):
            print(f"{prefix}{i+1}: {lines[i].strip()}")
