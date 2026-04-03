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
            obj[cur] = line.slice(c + 1).trim().replace(/^["']|["']$/g, '');
          } else if (cur && /^\s+\S/.test(line)) {
            obj[cur] += ' ' + line.trim().replace(/^["']|["']$/g, '');
          }
        }
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

  eleventyConfig.addFilter("dateDisplay", function(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
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
