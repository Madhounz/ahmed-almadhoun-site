const fs = require('fs');
const path = require('path');

function readMd(folderName) {
  const dir = path.join(__dirname, '_data', folderName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      try {
        const raw = fs.readFileSync(path.join(dir, f), 'utf8');
        const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!m) return null;
        const obj = {};
        let cur = null;
        for (const line of m[1].split('\n')) {
          if (/^[a-z]/.test(line)) {
            const c = line.indexOf(':');
            if (c === -1) continue;
            cur = line.slice(0, c).trim();
            obj[cur] = line.sl
