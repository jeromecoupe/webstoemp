const gulp = require("gulp");

// packages
const eslint = require("gulp-eslint");
const webpack = require("webpack");
const webpackconfig = require("../webpack.config");
const webpackstream = require("webpack-stream");

// Lint scripts
function scriptsLint() {
  return gulp
    .src([
      "./src/assets/js/modules/**/*",
      "./src/assets/js/main.js",
      "./gulpfile.js"
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scriptsBuild() {
  return (
    gulp
      .src(["./src/assets/js/**/*"])
      .pipe(webpackstream(webpackconfig, webpack))
      // folder only, filename is specified in webpack
      .pipe(gulp.dest("./dist/js/"))
  );
}

// exports (Common JS)
module.exports = {
  lint: scriptsLint,
  build: scriptsBuild
};
