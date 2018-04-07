"use strict";

// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cp = require("child_process");
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");

// BrowserSync
function browserSync() {
  browsersync.init({
    proxy: "www.webstoemp.test",
    port: 3000
  });
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./_site/assets/"]);
}

// Optimize Images
function images() {
  return gulp
    .src("./assets/img/**/*")
    .pipe(newer("./_site/assets/img"))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }]
      })
    )
    .pipe(gulp.dest("./_site/assets/img"));
}

// CSS task
function css() {
  return gulp
    .src("./assets/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ style: "expanded" }))
    .pipe(gulp.dest("./_site/assets/css/"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./_site/assets/css/"))
    .pipe(browsersync.stream());
}

// Concatenate and Minify JS task
function scripts() {
  return (
    gulp
      .src(["./assets/js/**/*"])
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig), webpack)
      //.pipe(uglify())
      .pipe(gulp.dest("./_site/assets/js/")) // filename in webpack config
      .pipe(browsersync.reload({ stream: true }))
  );
}

// Jekyll
function jekyll(done) {
  return cp
    .spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit" })
    .on("close", done);
}

// Watch files
function watchFiles() {
  gulp.watch("./assets/scss/**/*", css);
  gulp.watch("./assets/js/**/*", scripts);
  gulp.watch(
    [
      "./_includes/**/*",
      "./_layouts/**/*",
      "./_pages/**/*",
      "./_posts/**/*",
      "./_projects/**/*"
    ],
    gulp.series(jekyll, browserSyncReload)
  );
  gulp.watch("./assets/img/**/*", images);
}

// Tasks
gulp.task("images", images);
gulp.task("css", css);
gulp.task("scripts", scripts);
gulp.task("jekyll", jekyll);
gulp.task("clean", clean);

gulp.task(
  "build",
  gulp.series(clean, gulp.parallel(css, images, scripts, jekyll))
);
gulp.task("watch", gulp.parallel(watchFiles, browserSync));
