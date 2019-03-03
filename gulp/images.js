// packages
const fs = require("fs");
const glob = require("glob");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const path = require("path");
const sharp = require("sharp");

// specify transforms
const transforms = [
  {
    src: "./src/assets/img/blogposts/",
    dist: "./dist/img/blogposts/_1024x576/",
    options: {
      width: 1024,
      height: 576,
      fit: "cover"
    }
  },
  {
    src: "./src/assets/img/blogposts/",
    dist: "./dist/img/blogposts/_600x600/",
    options: {
      width: 600,
      height: 600,
      fit: "cover"
    }
  },
  {
    src: "./src/assets/img/projects/",
    dist: "./dist/img/projects/_800x600/",
    options: {
      width: 800,
      height: 600,
      fit: "cover"
    }
  }
];

// Check that directory exists (recursive)
function dirExists(path) {
  var dir = sanitizeDir(path);
  if (fs.existsSync(dir)) {
    return true;
  }
  return false;
}

// Make sure paths ends with a slash
function sanitizeDir(path) {
  let sanitizedPath = path.slice(-1) !== "/" ? `${path}/` : path;
  return sanitizedPath;
}

// Copy Images
function copy() {
  return gulp
    .src("./src/assets/img/**/*")
    .pipe(newer("./dist/img/"))
    .pipe(gulp.dest("./dist/img/"));
}

// Optimize images (src)
function optimise() {
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

// resize images
function resize(done) {
  transforms.forEach(function(transform) {
    let distDir = sanitizeDir(transform.dist);
    if (!dirExists(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    let files = glob.sync(sanitizeDir(transform.src) + "*");

    files.forEach(function(file) {
      let filename = path.basename(file);
      sharp(file)
        .resize(transform.options)
        .toFile(`${distDir}/${filename}`)
        .catch(err => {
          console.log(err);
        });
    });
  });
  done();
}

// exports (Common JS)
module.exports = {
  resize: resize,
  optimise: optimise,
  copy: copy
};
