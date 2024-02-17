// plugins
import syntaxHighlightPlugin from "@11ty/eleventy-plugin-syntaxhighlight";

// collections
import { blogposts } from "./src/_11ty/collections/blogposts.js";
import { projects } from "./src/_11ty/collections/projects.js";

// filters
import { limit } from "./src/_11ty/filters/limit.js";
import {
  dateFeed,
  dateFormat,
  dateFull,
  dateISO,
  dateYear,
} from "./src/_11ty/filters/dates.js";
import { json } from "./src/_11ty/filters/json.js";

export default function (eleventyConfig) {
  // collections
  eleventyConfig.addCollection("blogposts", blogposts);
  eleventyConfig.addCollection("projects", projects);

  // filters
  eleventyConfig.addFilter("limit", limit);
  eleventyConfig.addFilter("dateISO", dateISO);
  eleventyConfig.addFilter("dateFeed", dateFeed);
  eleventyConfig.addFilter("dateFull", dateFull);
  eleventyConfig.addFilter("dateFormat", dateFormat);
  eleventyConfig.addFilter("dateYear", dateYear);
  eleventyConfig.addFilter("json", json);

  // plugins
  eleventyConfig.addPlugin(syntaxHighlightPlugin, {
    trim: true,
  });

  // ignores
  eleventyConfig.ignores.add("src/assets/**/*");
  eleventyConfig.watchIgnores.add("src/assets/**/*");

  // passthrough copy
  eleventyConfig.setServerPassthroughCopyBehavior("copy");
  eleventyConfig.addPassthroughCopy({ "./src/static": "/" });
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");

  // server config
  eleventyConfig.setServerOptions({
    watch: ["./dist/assets/css/**/*.css", "./dist/assets/js/**/*.js"],
    port: 3000,
  });

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
}
