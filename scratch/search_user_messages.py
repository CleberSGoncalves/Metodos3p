import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

log_path = r"C:\Users\Cleber\.gemini\antigravity\brain\40b7cbe4-6bc6-45d6-aee8-e9d416bcd378\.system_generated\logs\transcript.jsonl"

print("Searching transcript for USER messages...")

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            if data.get("source") == "USER_EXPLICIT":
                print(f"--- Step {data.get('step_index')} (Line {line_num}) ---")
                print(data.get("content"))
                print("\n" + "="*80 + "\n")
        except Exception as e:
            pass
