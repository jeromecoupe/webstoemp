// plugins
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

// collections
const blogposts = require("./src/_11ty/collections/blogposts.js");
const projects = require("./src/_11ty/collections/projects.js");

// filters
const limit = require("./src/_11ty/filters/limit.js");
const dates = require("./src/_11ty/filters/dates.js");

module.exports = function (eleventyConfig) {
  // collections
  eleventyConfig.addCollection("blogposts", blogposts);
  eleventyConfig.addCollection("projects", projects);

  // filters
  eleventyConfig.addFilter("limit", limit);
  eleventyConfig.addFilter("dateISO", dates.dateISO);
  eleventyConfig.addFilter("dateFeed", dates.dateFeed);
  eleventyConfig.addFilter("dateFull", dates.dateFull);
  eleventyConfig.addFilter("dateFormat", dates.dateFormat);
  eleventyConfig.addFilter("dateYear", dates.dateYear);

  // plugins
  eleventyConfig.addPlugin(syntaxHighlight, {
    trim: true,
  });

  // ignores
  eleventyConfig.ignores.add("src/assets/**/*");

  // deep merge
  eleventyConfig.setDataDeepMerge(true);

  // pass through
  eleventyConfig.addPassthroughCopy({ "./src/static": "/" });
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");

  // watch targets
  eleventyConfig.addWatchTarget("src/assets/scss/**/*");
  eleventyConfig.addWatchTarget("src/assets/js/**/*");

  // wait (make sure CSS and JS compile)
  eleventyConfig.setWatchThrottleWaitTime(300);

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
  };
};
