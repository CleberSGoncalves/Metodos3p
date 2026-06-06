import subprocess
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

for filename in ["js/app.js", "js/chat.js", "js/financeiro.js", "js/protocolos.js", "style.css"]:
    proc = subprocess.run(["git", "diff", filename], capture_output=True)
    diff_output = proc.stdout.decode('utf-8', errors='replace')
    print(f"\n========================================\nDIFF FOR {filename}\n========================================")
    # Print only first 30 lines of each diff to avoid cluttering
    lines = diff_output.split('\n')
    for line in lines[:60]:
        print(line)
    if len(lines) > 60:
        print(f"... and {len(lines) - 60} more lines")
