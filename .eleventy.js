module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("photos");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("netlify.toml");

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
