// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cp = require("child_process");
const cssnano = require("cssnano");
const del = require("del");
const eslint = require("gulp-eslint");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
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

// Optimize Images
function images() {
  return gulp
    .src("./src/assets/img/**/*")
    .pipe(newer("./dist/img/"))
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
    .pipe(gulp.dest("./dist/img/"));
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
function fonts() {
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
  return cp.spawn("npx", ["eleventy"], { stdio: "inherit" });
}

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/scss/**/*", css);
  gulp.watch("./src/assets/js/**/*", gulp.series(scriptsLint, scripts));
  gulp.watch("./src/assets/img/**/*", images);
  gulp.watch("./src/assets/fonts/**/*", fonts);
  gulp.watch(
    [
      "./.eleventy.js",
      "./.eleventyignore",
      "./src/_blogposts/**/*",
      "./src/_projects/**/*",
      "./src/_data/**/*",
      "./src/_includes/**/*",
      "./src/_pages/**/*"
    ],
    gulp.series(eleventy, browserSyncReload)
  );
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(
  clean,
  gulp.parallel(fonts, css, images, eleventy, js)
);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.fonts = fonts;
exports.js = js;
exports.eleventy = eleventy;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
