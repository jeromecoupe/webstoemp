const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // collections
  eleventyConfig.addCollection("blogposts", require("./src/_11ty/collections/blogposts.js"));
  eleventyConfig.addCollection("projects", require("./src/_11ty/collections/projects.js"));

  // filters
  eleventyConfig.addFilter("limit", require("./src/_11ty/filters/limit.js"));
  eleventyConfig.addFilter("dateISO", require("./src/_11ty/filters/date.js").dateISO);
  eleventyConfig.addFilter("dateFeed", require("./src/_11ty/filters/date.js").dateFeed);
  eleventyConfig.addFilter("dateFull", require("./src/_11ty/filters/date.js").dateFull);
  eleventyConfig.addFilter("dateFormat", require("./src/_11ty/filters/date.js").dateFormat);
  eleventyConfig.addFilter("dateYear", require("./src/_11ty/filters/date.js").dateYear);

  // plugins
  eleventyConfig.addPlugin(syntaxHighlight, {
    trim: true,
  });

  // deep merge
  eleventyConfig.setDataDeepMerge(true);

  // pass through
  eleventyConfig.addPassthroughCopy({"./src/static":"/"});
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
    markdownTemplateEngine: "njk"
  };
};
