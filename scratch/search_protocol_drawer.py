import json

log_path = r"C:\Users\Cleber\.gemini\antigravity\brain\40b7cbe4-6bc6-45d6-aee8-e9d416bcd378\.system_generated\logs\transcript.jsonl"
out_path = r"e:\desenvolvimento\Reformasemerro\scratch\line_9905_content.txt"

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line_num, line in enumerate(f, 1):
        if line_num == 9905:
            try:
                data = json.loads(line)
                tc = data.get("tool_calls", [])[0]
                args = tc.get("arguments", tc.get("args", {}))
                if isinstance(args, str):
                    args = json.loads(args)
                code = args.get("ReplacementContent", "")
                
                with open(out_path, 'w', encoding='utf-8') as out_f:
                    out_f.write(code)
                print("Successfully wrote line 9905 content to scratch/line_9905_content.txt")
            except Exception as e:
                print("Error:", e)
