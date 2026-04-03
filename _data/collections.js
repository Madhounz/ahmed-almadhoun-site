const fs = require('fs');
const path = require('path');

function readCollection(folderName) {
  const dir = path.join(process.cwd(), '_data', folderName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      try {
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!match) return null;
        const block = match[1];
        const result = {};
        const lines = block.split('\n');
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          const col = line.indexOf(':');
          if (col === -1) { i++; continue; }
          const key = line.slice(0, col).trim();
          let val = line.slice(col + 1).trim();
          if (val === '>') {
            i++;
            const parts = [];
            while (i < lines.length && /^\s+/.test(lines[i])) {
              parts.push(lines[i].trim());
              i++;
            }
            result[key] = parts.join(' ');
            continue;
          }
          if (val === '') {
            i++;
            const items = [];
            while (i < lines.length && /^\s*-\s/.test(lines[i])) {
              items.push(lines[i].replace(/^\s*-\s*/, '').trim());
              i++;
            }
            result[key] = items.length ? items : undefined;
            continue;
          }
          // collect continuation lines (indented)
          while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
            i++;
            val += ' ' + lines[i].trim();
          }
          // strip surrounding quotes
          val = val.replace(/^["']|["']$/g, '');
          result[key] = val;
          i++;
        }
        return result;
      } catch(e) { return null; }
    })
    .filter(d => d && d.title);
}

module.exports = {
  photos: () => readCollection('photos'),
  research: () => readCollection('research'),
  thoughts: () => readCollection('thoughts')
};
