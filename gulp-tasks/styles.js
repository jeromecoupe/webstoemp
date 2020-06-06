// packages
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

// CSS task
function stylesBuild() {
  return gulp
    .src("./src/assets/scss/**/*.scss")
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist/css/"));
}

// exports
module.exports = {
  build: stylesBuild,
};
