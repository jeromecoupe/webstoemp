const moment = require("moment");

module.exports = function(eleventyConfig) {
  // blogpost collection
  eleventyConfig.addCollection("blogposts", function(collection) {
    return collection.getFilteredByGlob("./src/blogposts/*.md");
  });

  // projects collection
  eleventyConfig.addCollection("projects", function(collection) {
    return collection.getFilteredByGlob("./src/projects/*.md");
  });

  // limit filter
  eleventyConfig.addNunjucksFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  // date filter
  eleventyConfig.addNunjucksFilter("date", function(date, format) {
    return moment(date).format(format);
  });

  // pass throgh ./src/_redirects
  eleventyConfig.addPassthroughCopy("./src/_redirects");

  // Base config
  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
