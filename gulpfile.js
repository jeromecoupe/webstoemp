// Load plugins
const gulp = require("gulp");

// import tasks
const img = require("./gulp-tasks/images.js");
const server = require("./gulp-tasks/browsersync.js");
const js = require("./gulp-tasks/scripts.js");
const css = require("./gulp-tasks/styles.js");
const clean = require("./gulp-tasks/clean.js");
const eleventy = require("./gulp-tasks/eleventy.js");
const copy = require("./gulp-tasks/copy.js");

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/scss/**/*", css.build);
  gulp.watch("./src/assets/img/**/*", gulp.parallel(img.resize, copy.assets));
  gulp.watch("./src/assets/fonts/**/*", copy.assets);
  gulp.watch("./src/assets/js/**/*", js.build);
  gulp.watch(
    ["./.eleventy.js", "./src/**/*", "!./src/assets/**/*"],
    eleventy.build
  );
}

// define tasks
const watch = gulp.parallel(watchFiles, server.init);
const build = gulp.series(
  clean.dist,
  gulp.parallel(copy.assets, js.build, css.build, img.resize, eleventy.build)
);

// expose tasks to CLI
exports.watch = watch;
exports.build = build;
exports.default = build;
