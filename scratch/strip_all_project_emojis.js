const fs = require('fs');
const path = require('path');

// Regex for emojis
const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;

const targetFiles = [
  'assets/js/app.js',
  'assets/js/map-controller.js',
  'assets/js/telemetry-vault.js',
  'index.html',
  'assets/css/style.css'
];

// Specific semantic replacements for better UI
const specificReplacements = {
  '📷': '[PHOTO]',
  '⭐': '★',
  '⚠': '[ALERT]',
  '🎉': '',
  '🛰️': '',
  '🗺️': '',
  '📍': '',
  '🚗': '',
  '📡': '',
  '🌐': '',
  '🌍': '',
  '🚨': '[ALERT]',
  '🚧': '[ROADWORK]',
  '🚗💥': '[COLLISION]',
  '🚑': '[AMBULANCE]',
  '🔥': '[FIRE]',
  '🚔': '[PATROL]'
};

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalLen = content.length;

  for (const [em, repl] of Object.entries(specificReplacements)) {
    content = content.split(em).join(repl);
  }

  // Any remaining unicode emojis:
  content = content.replace(emojiRegex, '');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Processed ${file}`);
});

console.log('Finished stripping all project emojis.');
