// Load plugins
const gulp = require("gulp");

// import tasks
const img = require("./gulp/images.js");
const js = require("./gulp/scripts.js");
const server = require("./gulp/browsersync.js");
const css = require("./gulp/styles.js");
const fonts = require("./gulp/fonts.js");
const clean = require("./gulp/clean.js");
const eleventy = require("./gulp/eleventy.js");

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/scss/**/*", css.build);
  gulp.watch("./src/assets/js/**/*", scripts);
  gulp.watch("./src/assets/img/**/*", gulp.parallel(img.copy, img.resize));
  gulp.watch("./src/assets/fonts/**/*", fonts.copy);
  gulp.watch(
    [
      "./.eleventy.js",
      "./.eleventyignore",
      "./src/blogposts/**/*",
      "./src/projects/**/*",
      "./src/pages/**/*",
      "./src/_data/**/*",
      "./src/_includes/**/*"
    ],
    gulp.series(eleventy.build)
  );
}

// define complex tasks
const scripts = gulp.series(js.lint, js.build);
const images = gulp.series(img.optimise, gulp.parallel(img.copy, img.resize));
const watch = gulp.parallel(watchFiles, server.init);
const build = gulp.series(
  clean.all,
  gulp.parallel(fonts.copy, css.build, images, eleventy.build, scripts)
);

// expose tasks to CLI
exports.build = build;
exports.watch = watch;
exports.default = build;
