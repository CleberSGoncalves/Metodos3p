import json
import re

log_path = r"C:\Users\Cleber\.gemini\antigravity\brain\40b7cbe4-6bc6-45d6-aee8-e9d416bcd378\.system_generated\logs\transcript.jsonl"

print("Searching transcript for image layout details...")

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            # Look for lines where the model describes what it sees in the mockups
            if "model" in data.get("source", "").lower() and any(x in content for x in ["14.27.19", "14.27.20", "19.45.51", "12.00.11"]):
                print(f"--- Line {line_num} (Source: {data.get('source')}, Type: {data.get('type')}) ---")
                print(content[:1500])
                print("\n" + "="*80 + "\n")
        except Exception as e:
            pass
