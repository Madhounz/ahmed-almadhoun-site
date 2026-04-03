const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function readCollection(folder) {
  const dir = path.join(__dirname, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      return matter(content).data;
    })
    .filter(d => d && d.title);
}

module.exports = {
  photos: () => readCollection('photos'),
  research: () => readCollection('research'),
  thoughts: () => readCollection('thoughts')
};
