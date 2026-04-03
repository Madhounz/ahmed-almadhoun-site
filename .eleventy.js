const fs = require('fs');
const path = require('path');

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const col = line.indexOf(':');
    if (col === -1) continue;
    const key = line.slice(0, col).trim();
    let val = line.slice(col + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!val) continue;
    result[key] = val;
  }
  return result;
}

function readCollection(folderName) {
  const dir = path.join(__dirname, '_data', folderName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8')))
    .filter(d => d && d.title);
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("photos");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  eleventyConfig.addGlobalData("photos", () => readCollection('photos'));
  eleventyConfig.addGlobalData("research", () => readCollection('research'));
  eleventyConfig.addGlobalData("thoughts", () => readCollection('thoughts'));

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
