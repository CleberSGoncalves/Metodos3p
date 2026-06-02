const fs = require('fs');
const html = fs.readFileSync('e:/desenvolvimento/Reformasemerro/index.html', 'utf8');

const regex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*)?>/g;
let match;
const stack = [];
const lines = html.split('\n');

const ignoreTags = new Set(['meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'rect', 'line', 'circle', 'polyline', 'path', 'defs', 'lineargradient', 'stop', 'svg']);

console.log("Analyzing index.html tags...");

let hasError = false;

// We'll track tag positions
let pos = 0;
while ((match = regex.exec(html)) !== null) {
  const fullTag = match[0];
  const tagName = match[1].toLowerCase();
  const isClose = fullTag.startsWith('</');
  const index = match.index;
  
  // Calculate line number
  const lineNumber = html.substring(0, index).split('\n').length;
  
  if (ignoreTags.has(tagName)) {
    continue;
  }
  
  // Self closing tag check
  if (fullTag.endsWith('/>')) {
    continue;
  }
  
  if (isClose) {
    if (stack.length === 0) {
      console.error(`Error: Close tag </${tagName}> on line ${lineNumber} has no matching open tag.`);
      hasError = true;
    } else {
      const last = stack.pop();
      if (last.name !== tagName) {
        console.error(`Error: Mismatched tag on line ${lineNumber}. Expected </${last.name}> (opened on line ${last.line}), found ${fullTag}`);
        hasError = true;
        // Put it back to try to recover
        stack.push(last);
      }
    }
  } else {
    stack.push({ name: tagName, line: lineNumber, tag: fullTag });
  }
}

if (stack.length > 0) {
  console.log("\nUnclosed tags remaining in stack:");
  stack.forEach(t => {
    console.log(`- <${t.name}> opened on line ${t.line}: ${t.tag.substring(0, 50)}...`);
  });
  hasError = true;
} else {
  console.log("\nAll tags are balanced!");
}

if (hasError) {
  process.exit(1);
} else {
  console.log("Success!");
}
