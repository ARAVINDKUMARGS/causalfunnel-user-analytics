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

// Copy into apps/server/public and apps/demo-site for standalone deployments
const serverPublicDir = path.resolve(__dirname, '../../apps/server/public');
if (!fs.existsSync(serverPublicDir)) {
  fs.mkdirSync(serverPublicDir, { recursive: true });
}
fs.writeFileSync(path.join(serverPublicDir, 'tracker.js'), content, 'utf8');

const demoSiteDir = path.resolve(__dirname, '../../apps/demo-site');
fs.writeFileSync(path.join(demoSiteDir, 'tracker.js'), content, 'utf8');

console.log('Tracker built successfully ->', distPath);
console.log('Synced to ->', path.join(serverPublicDir, 'tracker.js'));
console.log('Synced to ->', path.join(demoSiteDir, 'tracker.js'));
