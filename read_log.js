const fs = require('fs');
const logPath = 'C:/Users/Cleber/.gemini/antigravity/brain/40b7cbe4-6bc6-45d6-aee8-e9d416bcd378/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
  const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
  let output = '';
  lines.forEach((line) => {
    try {
      const step = JSON.parse(line);
      if (step.step_index >= 1700 && step.step_index <= 1837) {
        output += `\n=== STEP ${step.step_index} (${step.source}) ===\n`;
        if (step.content) output += step.content + '\n';
        if (step.tool_calls) output += 'Tools: ' + JSON.stringify(step.tool_calls, null, 2) + '\n';
      }
    } catch (e) {}
  });
  fs.writeFileSync('e:/desenvolvimento/Reformasemerro/log_dump.txt', output, 'utf8');
  console.log('Log dumped successfully.');
} else {
  console.log('Log file not found');
}
