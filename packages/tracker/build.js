const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'tracker.js');
const distDir = path.join(__dirname, 'dist');
const distPath = path.join(distDir, 'tracker.js');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const content = fs.readFileSync(srcPath, 'utf8');
fs.writeFileSync(distPath, content, 'utf8');

console.log('Tracker built successfully ->', distPath);
