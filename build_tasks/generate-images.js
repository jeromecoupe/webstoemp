const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");
const sharp = require("sharp");
const transforms = [
  {
    // 1024x576 thumbnails for blogposts
    src: "./src/assets/img/blogposts/",
    dist: "./dist/assets/img/blogposts/1024x576/",
    formats: ["jpg", "webp"],
    options: {
      width: 1024,
      height: 576,
      fit: "cover",
    },
  },
  {
    // 600x600 thumbnails for blogposts
    src: "./src/assets/img/blogposts/",
    dist: "./dist/assets/img/blogposts/600x600/",
    formats: ["jpg", "webp"],
    options: {
      width: 600,
      height: 600,
      fit: "cover",
    },
  },
  {
    // 800x600 thumbnails for projects
    src: "./src/assets/img/projects/",
    dist: "./dist/assets/img/projects/800x600/",
    formats: ["jpg", "webp"],
    options: {
      width: 800,
      height: 600,
      fit: "cover",
    },
  },
];

/**
 * Generate images based on transforms object
 */
async function init() {
  // array for promises
  let sharpPromises = [];

  // loop through transforms
  transforms.forEach((transform) => {
    let inputDir = transform.src;
    let outputDir = transform.dist;
    let formats = transform.formats;
    let options = transform.options;

    // Create output dir if does not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get image files in input directory
    let imagesGlob = path.join(inputDir, "*.{jpg,jpeg,webp,png}");
    let imagesFiles = globSync(imagesGlob);

    // Resize and save each image to the output directory
    imagesFiles.forEach((file) => {
      // Create resized images for each specified formats
      formats.forEach((format) => {
        // get input image name
        let inputFileName = path.parse(file).name;

        // build image output path
        let outputPath = path.join(outputDir, `${inputFileName}.${format}`);

        // bail out if image output path exists
        if (fs.existsSync(outputPath)) return;

        // generate sharp promises
        try {
          // resize promise
          let sharpPromise = sharp(file)
            .resize(options)
            .toFile(outputPath)
            .catch((err) => {
              throw new Error(err);
            });

          // push promise to array
          sharpPromises.push(sharpPromise);
        } catch (err) {
          throw new Error(err);
        }
      });
    });
  });

  // resolve all promises in parallel
  try {
    await Promise.all(sharpPromises);
    console.log(`${sharpPromises.length} images processed`);
  } catch (err) {
    throw new Error(err);
  }
}

module.export = init();
