const moment = require("moment");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const now = new Date();

module.exports = function(eleventyConfig) {
  // blogpost collection
  eleventyConfig.addCollection("blogposts", function(collection) {
    return collection.getFilteredByGlob("./src/blogposts/*.md").filter(item => {
      return item.data.draft !== true && item.date <= now;
    });
  });

  // projects collection
  eleventyConfig.addCollection("projects", function(collection) {
    return collection.getFilteredByGlob("./src/projects/*.md");
  });

  // limit filter
  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  // date filter
  eleventyConfig.addFilter("date", function(date, format) {
    return moment(date).format(format);
  });

  // Syntax highlighting (prism)
  eleventyConfig.addPlugin(syntaxHighlight);

  // pass through
  eleventyConfig.addPassthroughCopy("./src/favicon.ico");
  eleventyConfig.addPassthroughCopy("./src/apple-touch-icon.png");

  // Base config
  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
