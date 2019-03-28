// Load plugins
const gulp = require("gulp");

// import tasks
const img = require("./gulp-tasks/images.js");
const js = require("./gulp-tasks/scripts.js");
const server = require("./gulp-tasks/browsersync.js");
const css = require("./gulp-tasks/styles.js");
const clean = require("./gulp-tasks/clean.js");
const eleventy = require("./gulp-tasks/eleventy.js");
const copy = require("./gulp-tasks/copy.js");

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/scss/**/*", css.build);
  gulp.watch("./src/assets/js/**/*", gulp.series(js.lint, js.build));
  gulp.watch("./src/assets/img/**/*", gulp.series(img.resize, copy.assets));
  gulp.watch("./src/assets/fonts/**/*", copy.assets);
  gulp.watch(
    [
      "./.eleventy.js",
      "./.eleventyignore",
      "./src/*",
      "./src/_data/**/*",
      "./src/_includes/**/*",
      "./src/blogposts/**/*",
      "./src/pages/**/*",
      "./src/projects/**/*"
    ],
    eleventy.build
  );
}

// define tasks
const watch = gulp.parallel(watchFiles, server.init);
const build = gulp.series(
  clean.dist,
  gulp.parallel(
    copy.assets,
    css.build,
    img.resize,
    eleventy.build,
    gulp.series(js.lint, js.build)
  )
);

// expose tasks to CLI
exports.build = build;
exports.watch = watch;
exports.default = build;
