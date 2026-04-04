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
        const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
        if (!m) return null;
        const obj = {};
        let cur = null;
        const lines = m[1].split('\n');
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          if (/^[a-z]/.test(line)) {
            const c = line.indexOf(':');
            if (c === -1) { i++; continue; }
            cur = line.slice(0, c).trim();
            const val = line.slice(c + 1).trim();
            if (val === '') {
              const items = [];
              i++;
              while (i < lines.length && /^\s*-\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*-\s*/, '').trim());
                i++;
              }
              obj[cur] = items;
              continue;
            }
            obj[cur] = val.replace(/^["']|["']$/g, '');
          } else if (cur && /^\s+\S/.test(line) && typeof obj[cur] === 'string') {
            obj[cur] += ' ' + line.trim().replace(/^["']|["']$/g, '');
          }
          i++;
        }
        if (m[2]) obj.body = m[2].trim();
        return obj;
      } catch(e) { return null; }
    })
    .filter(d => d && d.title);
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("photos");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  eleventyConfig.addGlobalData("photos", () => readMd('photos'));
  eleventyConfig.addGlobalData("research", () => readMd('research'));
  eleventyConfig.addGlobalData("thoughts", () => readMd('thoughts'));
  eleventyConfig.addPassthroughCopy("ahmed-almadhoun-cv.pdf");

  eleventyConfig.addFilter("dateDisplay", function(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
  });
  eleventyConfig.addFilter("striptags", function(str) {
  if (!str) return '';
  return str.replace(/[#*`_~\[\]]/g, '').trim();
});
eleventyConfig.addFilter("nl2br", function(str) {
  if (!str) return '';
  return str.replace(/\n/g, '\\n');
});
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
