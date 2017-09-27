"use strict";

// ---------------------------------------
// plugins
// ---------------------------------------

const browserSync = require("browser-sync").create();
const childProcess = require("child_process");
const del = require("del");
const gulp = require("gulp");
const gulpPlumber = require("gulp-plumber");
const gulpSass = require("gulp-sass");
const gulpRename = require("gulp-rename");
const gulpAutoprefixer = require("gulp-autoprefixer");
const gulpCssnano = require("gulp-cssnano");
const gulpEslint = require("gulp-eslint");
const gulpBabel = require("gulp-babel");
const gulpConcat = require("gulp-concat");
const gulpUglify = require("gulp-uglify");
const gulpNewer = require("gulp-newer");
const gulpImageresize = require("gulp-image-resize");
const gulpImagemin = require("gulp-imagemin");
const merge2 = require("merge2");
const globby = require("globby");

// ---------------------------------------
// config image transforms
// ---------------------------------------

const transforms = [
{
  "src": "./assets/img/blogposts/*",
  "dist": "./public/assets/img/blogposts/",
  "params": {
    "width": 500,
    "height": 500,
    "crop": true
  }
},
{
  "src": "./assets/img/banners/*",
  "dist": "./public/assets/img/banners/",
  "params": {
    "width": 100,
    "height": 100,
    "crop": true
  }
}
];

// ---------------------------------------
// browser sync
// ---------------------------------------

/**
 * Serve the ./public/ folder
 */

gulp.task("browser-sync", () => {
  browserSync.init({
    open: false,
    server: {
      baseDir: "public/"
    }
  });
});

// ---------------------------------------
// Images
// ---------------------------------------

/**
 * Clean unused thumbnails directories
 * 1. Build an array of all thumbs_xxx directories that should exist using the transforms map
 * 2. Build array of all thumbs_xxx directories in img dist
 * 3. Build a diff array (unused directories in img dist)
 * 4. Delete diff array
 */

gulp.task("img:clean:thumbsdirs", () => {
  globby("./public/assets/img/**/thumbs_[1-9]*x[1-9]*")
    .then((paths) => {

      // existing thumbs directories in dist
      const distThumbsDirs = paths;

      // create array of dirs that should exist by walking transforms map
      const srcThumbsDirs = transforms.map((transform) => transform.dist + "thumbs_" + transform.params.width + "x" + transform.params.height);

      // array of dirs to delete
      const todeleteThumbsDirs = distThumbsDirs.filter((el) => srcThumbsDirs.indexOf(el) === -1);

      // pass array to next step
      return todeleteThumbsDirs;

    })
    .then((todeleteThumbsDirs) => {

      // deleted diff thumbnails directories
      del.sync(todeleteThumbsDirs);

    })
    .catch((error) => {

      console.log(error);

    });
});

/**
 * Clean images
 * 1. get arrays of filepaths in images src (base images) and dist (base images and thumbnails)
 * 2. build list of filenames in src
 *    - loop through filepaths in dist, extract filenames, compare with filenames in src
 *    - if no match, add filepath to delete array
 *    - thumbnails have same filename as base images > we can delete both base images and corresponding thumbnails
 * 3. diff and build array of files to delete (base images and thumbnails)
 * 4. delete files
 */

gulp.task("img:clean", ["img:clean:thumbsdirs"], () => {

  // get arrays of src and dist filepaths (returns array of arrays)
  return Promise.all([

    globby("./assets/img/**/*", {nodir: true}),
    globby("./public/assets/img/**/*", {nodir: true})

  ])
  .then((paths) => {

    // create arrays of filepaths from array of arrays returned by promise
    const srcFilepaths = paths[0];
    const distFilepaths = paths[1];

    // empty array of files to delete
    const distFilesToDelete = [];

    // diffing
    distFilepaths.map((distFilepath) => {

      // sdistFilepathFiltered: remove dist root folder and thumbs folders names for comparison
      const distFilepathFiltered = distFilepath.replace(/\/public/, "").replace(/thumbs_[0-9]+x[0-9]+\//, "");

      // check if simplified dist filepath is in array of src simplified filepaths
      // if not, add it to the delete array
      if ( srcFilepaths.indexOf(distFilepathFiltered) === -1 ) {
        distFilesToDelete.push(distFilepath);
      }

    });

    // return array of files to delete
    return distFilesToDelete;

  })
  .then((distFilesToDelete) => {

    // delete files
    del.sync(distFilesToDelete);

  })
  .catch((error) => {

    console.log(error);

  });

});

/**
 * Copy original images
 * - check if images are newer than existing ones
 * - if they are, optimise and copy them
 */

gulp.task("img:copy", ["img:clean"], () => {
  return gulp.src("./assets/img/**/*")
    .pipe(gulpNewer("./public/assets/img/"))
    .pipe(gulpImagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }, { removeUselessStrokeAndFill: false }]
    }))
    .pipe(gulp.dest("./public/assets/img/"));
});

/**
 * Make thumbnails
 * 1. walk transforms map to build an array of streams
 *    - get base image in src
 *    - check if images in src are newer than images in dist
 *    - if they are, make thumbnails and minify
 * 2. merge streams to create all thumbnails in parallel
 */

gulp.task("img:thumbnails", ["img:clean"], () => {

  // create empty stream array for merge
  const streams = [];

  // loop through transforms and add to streams array
  transforms.map((transform) => {

    // create a stream for each transform
    streams.push(
      gulp.src(transform.src)
        .pipe(gulpNewer(transform.dist + "thumbs_" + transform.params.width + "x" + transform.params.height))
        .pipe(gulpImageresize({
          imageMagick: true,
          width: transform.params.width,
          height: transform.params.width,
          crop: transform.params.crop
        }))
        .pipe(gulpImagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }, { removeUselessStrokeAndFill: false }]
        }))
        .pipe(gulp.dest(transform.dist + "thumbs_" + transform.params.width + "x" + transform.params.height))
    );

  });

  // merge streams
  return merge2(streams);

});

// ---------------------------------------
// CSS
// ---------------------------------------

// autoprefixer config in package.json
gulp.task("css", () => {
  return gulp.src("assets/scss/**/*.scss")
    .pipe(gulpPlumber())
    .pipe(gulpSass({ style: "expanded" }))
    .pipe(gulp.dest("./public/assets/css/"))
    .pipe(gulpAutoprefixer())
    .pipe(gulpRename({ suffix: ".min" }))
    .pipe(gulpCssnano())
    .pipe(gulp.dest("./public/assets/css/"))
    .pipe(browserSync.stream());
});

// ---------------------------------------
// JS
// ---------------------------------------

/**
 * lint with Eslint
 */

gulp.task("js:lint", () => {
  return gulp.src(["./assets/js/**/*.js", "./gulpfile.js"])
    .pipe(gulpPlumber())
    .pipe(gulpEslint())
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failAfterError());
});

/**
 * process JS
 * 1. run files through babel
 * 2. concatenate
 * 3. uglify concatenated file
 */

gulp.task("js", ["js:lint"], () => {
  return gulp.src("./assets/js/**/*")
    .pipe(gulpPlumber())
    .pipe(gulpBabel())
    .pipe(gulpConcat("main.js"))
    .pipe(gulp.dest("./public/assets/js/"))
    .pipe(gulpRename({ suffix: ".min" }))
    .pipe(gulpUglify())
    .pipe(gulp.dest("./public/assets/js/"))
    .pipe(browserSync.stream());
});

// ---------------------------------------
// Hugo
// ---------------------------------------

/**
 * build hugo site
 */

gulp.task("hugo:build", ["hugo:clean"], (done) => {
  return childProcess.spawn("hugo", {stdio: "inherit"})
    .on("close", done);
});

/**
 * reload browsers upon build
 */

gulp.task("hugo:rebuild", ["hugo:build"], () => {
  browserSync.reload();
});

/**
 * delete public directory content
 */

gulp.task("hugo:clean", () => {
  del.sync([
    "public/**/*",
    "!public/assets",
    "!public/assets/**/*"
  ]);
});


// ---------------------------------------
// Tasks
// ---------------------------------------

/**
 * main gulp tasks
 */

gulp.task("hugo", ["hugo:rebuild"]);
gulp.task("img", ["img:copy", "img:thumbnails"]);
gulp.task("default", ["css", "js", "hugo", "img"]);

/**
 * watch task
 */

gulp.task("watch", ["browser-sync"], () => {
  gulp.watch(["assets/scss/**/*.scss"], ["css"]);
  gulp.watch(["assets/js/**/*.js", "./gulpfile.js"], ["js"]);
  gulp.watch(["assets/img/**/*"], ["img"]);
  gulp.watch([
    "archetypes/**/*",
    "content/**/*",
    "data/**/*",
    "layouts/**/*"
  ], ["hugo"]);
});
