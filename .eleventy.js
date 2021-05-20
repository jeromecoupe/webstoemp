const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // blogposts collection
  eleventyConfig.addCollection(
    "blogposts",
    require("./eleventy/collections/blogposts.js")
  );
  // projects collection
  eleventyConfig.addCollection(
    "projects",
    require("./eleventy/collections/projects.js")
  );

  // filters
  eleventyConfig.addFilter("limit", require("./eleventy/filters/limit.js"));
  eleventyConfig.addFilter("date", require("./eleventy/filters/date.js"));

  // shortcodes
  eleventyConfig.addShortcode(
    "transform",
    require("./eleventy/shortcodes/transform-images.js")
  );

  // Syntax highlighting (prism)
  eleventyConfig.addPlugin(syntaxHighlight, {
    trim: true,
  });

  // deep merge
  eleventyConfig.setDataDeepMerge(true);

  // pass through
  eleventyConfig.addPassthroughCopy("./src/favicon.ico");
  eleventyConfig.addPassthroughCopy("./src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy({ "./src/assets/img": "img" });
  eleventyConfig.addPassthroughCopy({ "./src/assets/fonts": "fonts" });

  // base config
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true,
  };
};
