import subprocess

proc = subprocess.run(["git", "diff", "index.html"], capture_output=True)
diff_output = proc.stdout.decode('utf-8', errors='replace')

with open("e:/desenvolvimento/Reformasemerro/scratch/diff_index_utf8.txt", "w", encoding="utf-8") as f:
    f.write(diff_output)

print("Saved diff_index_utf8.txt successfully!")
