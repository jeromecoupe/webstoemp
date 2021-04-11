// packages
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const sharp = require("sharp");

// specify transforms
const transforms = [
  {
    src: "./src/assets/img/blogposts/*",
    dist: "./dist/img/blogposts/_1024x576/",
    options: {
      width: 1024,
      height: 576,
      fit: "cover",
    },
  },
  {
    src: "./src/assets/img/blogposts/*",
    dist: "./dist/img/blogposts/_600x600/",
    options: {
      width: 600,
      height: 600,
      fit: "cover",
    },
  },
  {
    src: "./src/assets/img/projects/*",
    dist: "./dist/img/projects/_800x600/",
    options: {
      width: 800,
      height: 600,
      fit: "cover",
    },
  },
];

/**
 * Walk array of filepaths to make
 * thumbnaisla and write them to disk
 *
 * @param {array} filepaths - array of filepaths
 * @param {object} transform - Sharp options and location of dist folder
 */
const makeThumbnails = (filepaths, transform) => {
  filepaths.forEach((file) => {
    let filename = path.basename(file);
    sharp(file)
      .resize(transform.options)
      .toFile(`${transform.dist}/${filename}`)
      .catch((err) => {
        console.log(err);
      });
  });
};

/**
 * Init function
 * For each specified transform
 * - get src and glob filepaths
 * - pass filepaths and transform object
 */
const init = () => {
  transforms.forEach((transform) => {
    // if dist folder does not exist create it with all above folders
    if (!fs.existsSync(transform.dist)) {
      fs.mkdirSync(transform.dist, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }

    // glob all files
    let filepaths = glob.sync(transform.src);

    // make thumbnails
    makeThumbnails(filepaths, transform);
  });
};

init();
