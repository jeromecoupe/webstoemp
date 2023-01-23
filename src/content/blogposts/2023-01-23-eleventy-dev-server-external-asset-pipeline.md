---
title: "External Asset Pipeline with Eleventy"
excerpt: "I like to use NPM scripts for my asset pipeline instead of using Eleventy to generate assets and orchestrate everything. The latest release of Eleventy Dev Server makes that approach both easy to implement and quite performant."
image: "merging-train-tracks.jpg"
imageAlt: "Mergins train tracks ahead - Photo by Lance Grandahl on Unspash"
tags:
  - Front-end
  - 11ty
---

## Two approaches to asset pipelines

As outlined by Max Bock in [his infamous blogpost about asset pipelines](https://mxb.dev/blog/eleventy-asset-pipeline/), there are two main ways to transform your assets source files (SCSS and JS mainly) into production-ready output files.

1. Use external tools working in parallel with Eleventy
2. Use Eleventy to manage everything

Here is another [nice blogpost by Vadim Makeev](https://chriskirknielsen.com/blog/eleventy-asset-pipeline-precompiled-assets/) if you would rather like Eleventy to be in charge. As for me, I like the flexibility of an external build pipeline, mainly because I can easily use the same approach in non-Eleventy contexts.

My default solution is to use NPM scripts to compile assets directly to my output folder. Meanwhile, using a package like `npm-run-all`, I can have Eleventy do its thing. Running those processes in parallel is quite efficient and the separation of concerns appeals to me.

Previously, you could essentially go down three different routes with this external approach:

1. Use `addWatchTarget` in your configuration file to watch source files and trigger an Eleventy build when any file changes. Eleventy builds are fast, but triggering a whole build to reload my browser feels a bit wasteful. It also introduces a potential race condition between your external asset pipeline and Eleventy.
2. Generate compiled assets in a folder added to `.gitignore` as well as to Eleventy ignore rules and use `addPassthroughCopy` to copy those generated assets to the output folder. No Eleventy build is triggered but your assets are now written twice to disc, which also seems a bit awkward.
3. Use an external package like Browsersync as a local server to do the watching. Easy to manage via the CLI and the `--files` option allows you to watch your entire output directory to trigger browser reloads.

## A native performant solution

With the 1.0 version of [Eleventy Dev Server](https://www.11ty.dev/docs/dev-server/), I can now use a native and elegant solution.

I can keep building my assets with NPM scripts and run `npx eleventy --serve --quiet` in parallel. The trick here is to use the new `watch` to target the output directories used by your build process.

Any change to files in these directories will then trigger a server reload, even if those changes are the result of an external asset pipeline.

Here is a bare bones sample of the scripts I use in development. You could use `--watch` flags instead of the `onchange` package but again, I like the separation of concerns (and I also think it is easier to read and understand).

```json
"scripts": {
  "server": "npx @11ty/eleventy --serve --quiet",
  "styles:dev": "sass --embed-source-map --source-map-urls=\"absolute\" \"./src/assets/scss/main.scss\" \"./dist/assets/css/main.css\"",
  "scripts:dev": "esbuild \"./src/assets/js/main.js\" --target=es2020 --bundle --outfile=\"./dist/assets/js/main.bundle.js\"",
  "watch:scripts": "onchange \"./src/assets/js/**/*\" -- npm run scripts:dev",
  "watch:styles": "onchange \"./src/assets/scss/**/*\" -- npm run styles:dev",
  "dev": "npm-run-all --parallel server watch:*"
},
```

And here is the relevant portion of an Eleventy config file.

```js
module.exports = function (eleventyConfig) {
  // ---------- other config options ----------

  // ignore source assets (processing and watching)
  eleventyConfig.ignores.add("./src/assets/**/*");
  eleventyConfig.watchIgnores.add("./src/assets/**/*");

  // pass through (copy fonts and images to output directory)
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");

  // server config (watch generated assets in dist folder)
  eleventyConfig.setServerOptions({
    watch: ["./dist/assets/css/**/*.css", "./dist/assets/js/**/*.js"],
    port: 3000,
  });
};
```

That's all there is to it, really. [This very website](https://github.com/jeromecoupe/webstoemp) uses the approach outlined above. So far, I am very happy with it and plan to use it for all my other projects once Eleventy 2.0 comes out of beta.
