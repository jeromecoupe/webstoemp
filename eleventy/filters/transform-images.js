const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const transformsPath = "./dist/transforms/";
const transformsUrl = "/transforms/";

/**
 * Check directory exists, if not, make it (recursively)
 * @param {string} path - path to folder
 */

function checkDirExists(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
}

/**
 * Transform image using Sharp
 * @param {string} imagePath - full path to image
 * @param {object} sharpOptions - resize and format options for Sharp (width, height, format)
 */

function transformImage(imagePath, sharpOptions) {
  checkDirExists(transformsPath);

  if (!fs.existsSync(imagePath)) {
    let message = `Image transform source does not exist: ${imagePath}`;
    throw new Error(message);
  }

  let inputFilename = path.parse(imagePath).name;
  let inputExtension = path.parse(imagePath).ext.replace(".", "");
  let format = sharpOptions.format || inputExtension;
  let outputWidth = sharpOptions.width || "auto";
  let outputHeight = sharpOptions.height || "auto";
  let outputFilename = `${inputFilename}_${outputWidth}x${outputHeight}.${format}`;

  let outputPath = path.normalize(`${transformsPath}/${outputFilename}`);
  let outputUrl = path.normalize(`${transformsUrl}/${outputFilename}`);

  if (!fs.existsSync(outputPath)) {
    sharp(imagePath)
      .toFormat(format)
      .resize(sharpOptions)
      .toFile(outputPath)
      .catch((err) => {
        throw new Error(err);
      });
  }

  return outputUrl;
}

module.exports = transformImage;
