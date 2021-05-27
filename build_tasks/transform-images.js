const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const transforms = [
  {
    // 1024x576 thumbnails for blogposts
    src: "./src/assets/img/blogposts/*",
    dist: "./dist/assets/img/blogposts/1024x576/",
    formats: ["jpg"],
    options: {
      width: 1024,
      height: 576,
      fit: "cover",
    },
  },
  {
    // 600x600 thumbnails for blogposts
    src: "./src/assets/img/blogposts/*",
    dist: "./dist/assets/img/blogposts/600x600/",
    formats: ["jpg"],
    options: {
      width: 600,
      height: 600,
      fit: "cover",
    },
  },
  {
    // 800x600 thumbnails for projects
    src: "./src/assets/img/projects/*",
    dist: "./dist/assets/img/projects/800x600/",
    formats: ["jpg"],
    options: {
      width: 800,
      height: 600,
      fit: "cover",
    },
  },
];

/**
 * Check supplied format is allowed
 * @param {string} format
 */
function checkFormats(format) {
  const allowedFormats = ["jpg", "jpeg", "png", "webp", "avif"];

  if (!allowedFormats.includes(format)) {
    throw new Error(`${format} is not an allowed format: ${allowedFormats}`);
  }
}

/**
 * Create Directory recursively if not readable
 * @param {string} path - valid dir path
 * @returns
 */
function createDir(path) {
  if (fs.existsSync(path)) return;

  fs.mkdirSync(path, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

/**
 * Resize Image
 * @param {string} srcImage - path of src image
 * @param {string} distImage - path of dist image
 * @param {format} format - format of dist image
 * @param {object} resizeOptions - Sharp resize options
 */
function resizeImage(scrPath, distPath, format, resizeOptions) {
  if (fs.existsSync(distPath)) return;
  resizeOptions.width ? parseInt(resizeOptions.width, 10) : null;
  resizeOptions.height ? parseInt(resizeOptions.height, 10) : null;

  sharp(scrPath)
    .toFormat(format)
    .resize(resizeOptions)
    .toFile(distPath)
    .catch((err) => {
      throw new Error(err);
    });
}

function init() {
  transforms.forEach((transform) => {
    // create dist folder
    createDir(transform.dist);

    // glob all files
    let srcPaths = glob.sync(transform.src);

    // loop through files
    srcPaths.forEach((sourcePath) => {
      // get formats
      let formats = transform.formats;
      if (!Array.isArray(formats)) {
        throw new Error(`${formats} must be an array`);
      }

      // loop through formats
      formats.forEach((format) => {
        // check for allowed formats
        checkFormats(format);

        // get filename and output path
        let inputFilename = path.parse(sourcePath).name;
        let outputPath = path.normalize(
          `${transform.dist}/${inputFilename}.${format}`
        );

        // resize images
        resizeImage(sourcePath, outputPath, format, transform.options);
      });
    });
  });
}

module.export = init();
