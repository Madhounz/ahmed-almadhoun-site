const fs = require('fs');
const path = require('path');

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  const lines = yaml.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const col = line.indexOf(':');
    if (col === -1) { i++; continue; }
    const key = line.slice(0, col).trim();
    let val = line.slice(col + 1).trim();
    if (val === '>') {
      let block = [];
      i++;
      while (i < lines.length && (lines[i].startsWith(' ') || lines[i].startsWith('\t'))) {
        block.push(lines[i].trim());
        i++;
      }
      result[key] = block.join(' ');
      continue;
    }
    if (val === '') {
      let items = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s*-\s/)) {
        items.push(lines[i].replace(/^\s*-\s*/, '').trim());
        i++;
      }
      result[key] = items.length ? items : undefined;
      continue;
    }
    if (val.startsWith('"')) {
      let full = val;
      while (!full.slice(1).includes('"') && i + 1 < lines.length) {
        i++;
        full += ' ' + lines[i].trim();
      }
      val = full.replace(/^"/, '').replace(/"$/, '');
    } else if (val.startsWith("'")) {
      val = val.replace(/^'/, '').replace(/'$/, '');
    }
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
        return parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
      } catch(e) { return null; }
    })
    .filter(d => d && d.title);
}

module.exports = {
  photos: () => readCollection('photos'),
  research: () => readCollection('research'),
  thoughts: () => readCollection('thoughts')
};
