const gulp = require("gulp");

// packages
const eslint = require("gulp-eslint");
const webpack = require("webpack");
const webpackConfig = require("../webpack.config.js");

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
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      // reject if errors
      if (err) {
        return reject(err);
      }
      // log as the CLI would
      console.log(
        stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true // Shows colors in the console
        })
      );
      // resolve
      resolve();
    });
  });
}

// exports (Common JS)
module.exports = {
  lint: scriptsLint,
  build: scriptsBuild
};
