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
        const yaml = require('js-yaml');
        return yaml.load(match[1]);
      } catch(e) { return null; }
    })
    .filter(d => d && d.title);
}

module.exports = {
  photos: () => readCollection('photos'),
  research: () => readCollection('research'),
  thoughts: () => readCollection('thoughts')
};
