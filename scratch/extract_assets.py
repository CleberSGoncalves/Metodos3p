import json

log_path = r"C:\Users\Cleber\.gemini\antigravity\brain\40b7cbe4-6bc6-45d6-aee8-e9d416bcd378\.system_generated\logs\transcript.jsonl"

out = []
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line)
            step_idx = obj.get('step_index')
            if 9080 <= step_idx <= 9128:
                out.append(f"STEP: {step_idx} | SOURCE: {obj.get('source')} | TYPE: {obj.get('type')}")
                out.append(str(obj.get('content', '')))
                if obj.get('tool_calls'):
                    out.append(f"TOOL CALLS: {json.dumps(obj.get('tool_calls'))}")
                out.append("="*80)
        except Exception as e:
            pass

with open(r"e:\desenvolvimento\Reformasemerro\scratch\transcript_range.txt", "w", encoding="utf-8") as f_out:
    f_out.write("\n".join(out))
print("Done dumping steps range!")
