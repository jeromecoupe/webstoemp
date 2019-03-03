// packages
const gulp = require("gulp");
const newer = require("gulp-newer");

// Copy fonts
function copy() {
  return gulp
    .src("./src/assets/fonts/**/*")
    .pipe(newer("./dist/fonts/"))
    .pipe(gulp.dest("./dist/fonts/"));
}

// exports
module.exports = {
  copy: copy
};
