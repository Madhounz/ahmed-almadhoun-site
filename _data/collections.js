const fs = require('fs');
const path = require('path');

function parseYaml(text) {
  const result = {};
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const col = line.indexOf(':');
    if (col === -1) { i++; continue; }
    const key = line.slice(0, col).trim();
    let val = line.slice(col + 1);
    // collect all continuation lines
    while (i + 1 < lines.length && lines[i+1].match(/^[ \t]+[^ \t-]/)) {
      i++;
      val += ' ' + lines[i].trim();
    }
    val = val.trim();
    if (val === '' || val === '>') {
      // block or list
      i++;
      const items = [];
      while (i < lines.length && lines[i].match(/^[ \t]*-[ \t]/)) {
        items.push(lines[i].replace(/^[ \t]*-[ \t]*/, '').trim());
        i++;
      }
      if (items.length) result[key] = items;
      continue;
    }
    // strip quotes
    val = val.replace(/^["']/, '').replace(/["']$/, '');
    result[key] = val;
    i++;
  }
  return result;
}

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
        return parseYaml(match[1]);
      } catch(e) { return null; }
    })
    .filter(d => d && d.title);
}

module.exports = {
  photos: () => readCollection('photos'),
  research: () => readCollection('research'),
  thoughts: () => readCollection('thoughts')
};
