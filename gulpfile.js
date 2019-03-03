// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cp = require("child_process");
const cssnano = require("cssnano");
const del = require("del");
const eslint = require("gulp-eslint");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000,
    open: false
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean
function clean() {
  return del(["./dist/"]);
}

// Copy Images
function imagesCopy() {
  return gulp.src("./src/assets/img/**/*").pipe(gulp.dest("./dist/img/"));
}

function imagesOptimise() {
  return gulp
    .src("./src/assets/img/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./src/assets/img/"));
}

// CSS task
function css() {
  return gulp
    .src("./src/assets/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest("./dist/css/"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./dist/css/"))
    .pipe(browsersync.stream());
}

// Copy fonts
function fontsCopy() {
  return gulp.src("./src/assets/fonts/**/*").pipe(gulp.dest("./dist/fonts/"));
}

// Lint scripts
function scriptsLint() {
  return gulp
    .src([
      "./src/assets/js/modules/**/*",
      "./src/assets/js/main.js",
      "./gulpfile.js"
    ])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(["./src/assets/js/**/*"])
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig, webpack))
      // folder only, filename is specified in webpack
      .pipe(gulp.dest("./dist/js/"))
      .pipe(browsersync.stream())
  );
}

// Eleventy
function eleventy() {
  return cp.spawn("npx", ["eleventy", "--quiet"], { stdio: "inherit" });
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(
  clean,
  gulp.parallel(fontsCopy, css, imagesCopy, eleventy, js)
);
const watch = gulp.parallel(watchFiles, browserSync);

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/scss/**/*", css);
  gulp.watch("./src/assets/js/**/*", gulp.series(scriptsLint, scripts));
  gulp.watch("./src/assets/img/**/*", imagesCopy);
  gulp.watch("./src/assets/fonts/**/*", fontsCopy);
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
    gulp.series(eleventy, browserSyncReload)
  );
}

// export tasks
exports.images = imagesOptimise;
exports.css = css;
exports.js = js;
exports.eleventy = eleventy;
exports.build = build;
exports.watch = watch;
exports.default = build;
