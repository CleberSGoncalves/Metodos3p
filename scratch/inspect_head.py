import subprocess

# Run git show HEAD:index.html and read bytes
proc = subprocess.run(["git", "show", "HEAD:index.html"], capture_output=True)
content = proc.stdout.decode('utf-8', errors='replace')

# Write to a UTF-8 file
with open("e:/desenvolvimento/Reformasemerro/scratch/head_index_utf8.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Saved head_index_utf8.html successfully!")
