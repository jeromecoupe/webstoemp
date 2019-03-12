// Load plugins
const gulp = require("gulp");

// import tasks
const img = require("./gulp-tasks/images.js");
const js = require("./gulp-tasks/scripts.js");
const server = require("./gulp-tasks/browsersync.js");
const css = require("./gulp-tasks/styles.js");
const fonts = require("./gulp-tasks/fonts.js");
const clean = require("./gulp-tasks/clean.js");
const eleventy = require("./gulp-tasks/eleventy.js");

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/scss/**/*", css.build);
  gulp.watch("./src/assets/js/**/*", scripts);
  gulp.watch("./src/assets/img/**/*", images);
  gulp.watch("./src/assets/fonts/**/*", fonts.copy);
  gulp.watch(
    ["./.eleventy.js", "./.eleventyignore", "./src/**/*"],
    eleventy.build
  );
}

// define tasks
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
