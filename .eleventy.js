const moment = require("moment");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // blogposts collection
  eleventyConfig.addCollection("blogposts", function (collection) {
    const now = new Date();

    return collection
      .getFilteredByGlob("./src/blogposts/*.md")
      .filter((item) => {
        return item.data.draft !== true && item.date <= now;
      });
  });

  // projects collection
  eleventyConfig.addCollection("projects", function (collection) {
    return collection.getFilteredByGlob("./src/projects/*.md");
  });

  // limit filter
  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  // date filter
  eleventyConfig.addFilter("date", function (date, format) {
    return moment(date).format(format);
  });

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
