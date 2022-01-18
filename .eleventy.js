const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // blogposts collection
  eleventyConfig.addCollection(
    "blogposts",
    require("./src/_11ty/collections/blogposts.js")
  );
  // projects collection
  eleventyConfig.addCollection(
    "projects",
    require("./src/_11ty/collections/projects.js")
  );

  // filters
  eleventyConfig.addFilter("limit", require("./src/_11ty/filters/limit.js"));
  eleventyConfig.addFilter(
    "dateISO",
    require("./src/_11ty/filters/dateISO.js")
  );
  eleventyConfig.addFilter(
    "dateFull",
    require("./src/_11ty/filters/dateFull.js")
  );
  eleventyConfig.addFilter(
    "dateFormat",
    require("./src/_11ty/filters/dateFormat.js")
  );

  // plugins
  eleventyConfig.addPlugin(syntaxHighlight, {
    trim: true,
  });

  // deep merge
  eleventyConfig.setDataDeepMerge(true);

  // pass through
  eleventyConfig.addPassthroughCopy("./src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("./src/favicon.ico");
  eleventyConfig.addPassthroughCopy("./src/robots.txt");
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");

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
