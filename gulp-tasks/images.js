// packages
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const sharp = require("sharp");
const imagemin = require("gulp-imagemin");
const gulp = require("gulp");

// specify transforms
const transforms = [
  {
    src: "./src/assets/img/blogposts/*",
    dist: "./dist/img/blogposts/_1024x576/",
    options: {
      width: 1024,
      height: 576,
      fit: "cover"
    }
  },
  {
    src: "./src/assets/img/blogposts/*",
    dist: "./dist/img/blogposts/_600x600/",
    options: {
      width: 600,
      height: 600,
      fit: "cover"
    }
  },
  {
    src: "./src/assets/img/projects/*",
    dist: "./dist/img/projects/_800x600/",
    options: {
      width: 800,
      height: 600,
      fit: "cover"
    }
  }
];

// resize images
function resizeImages(done) {
  transforms.forEach(function(transform) {
    let distDir = transform.dist;

    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    let files = glob.sync(transform.src);

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

// optimize images in place
function optimiseImages() {
  return gulp
    .src("./src/assets/img/**/*", { base: "./src/assets/img" })
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { collapseGroups: true }]
        })
      ])
    )
    .pipe(gulp.dest("./src/assets/img/"));
}

// exports (Common JS)
module.exports = {
  resize: resizeImages,
  optimise: optimiseImages
};
