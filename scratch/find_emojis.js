const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
let found = 0;
const results = [];
lines.forEach((line, idx) => {
  if (emojiRegex.test(line)) {
    found++;
    if (results.length < 80) {
      results.push(`Line ${idx + 1}: ${line.trim().slice(0, 110)}`);
    }
  }
});

console.log('Total lines with emojis:', found);
results.slice(0, 40).forEach(r => console.log(r));
