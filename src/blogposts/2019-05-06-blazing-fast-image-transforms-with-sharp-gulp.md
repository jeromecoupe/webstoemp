---
title: "Blazing fast image transforms with Sharp and Gulp"
excerpt: "In this responsive age, generating images thumbnails is a common build step for many applications and websites. It is also quite a resources intensive and time consuming one. By combining Sharp with Gulp, we can build a very fast thumbnails-generation task."
image: "speed.jpg"
imageAlt: "Speed - Photo by Marc Sendra Martorell"
tags:
  - Sharp
  - Images
  - Resize
  - Thumbnails
  - Jamstack
---

## Requirements

For many projects I work on, especially [JAMstack](https://jamstack.org/) ones, having a quick way to generate thumbnails based on source images is crucial. Here is what I generally need:

- easy integration with Gulp (Node.js based)
- ability to specify different source and output locations
- ability to specify transforms characteristics per location
- wide range of operations available (resize, rotate, masks, filters, etc.)
- as fast as possible

## Sharp

[Sharp](https://github.com/lovell/sharp) is a Node.js image processing library to which we can easily use in a Gulp task. It offers a wide range of options and oparations we can use and is a whole lot faster and more flexible than alternatives like `gulp-image-resize` for example.

Let's first install `sharp` as a dependency

```
npm install --save-dev sharp
```

## Gulp structure

Whenever I deal with complex tasks, I tend to split them into their own external files. In this case, here is the structure we are going to use:

```text
+-- gulpfile.js
+-- gulp_tasks
    +-- images.js
    ... other tasks
```

That way, we can make tasks self-contained and just import or require them. Our main `gulpfile.js` is only used to compose complex tasks and to expose relevant tasks to the Gulp CLI using `exports`.

If you want a better overview of how to use Gulp 4, have a look at this [excellent article on upgrading to Gulp 4 by Joe Zimmerman](https://www.joezimjs.com/javascript/complete-guide-upgrading-gulp-4/) or, alternatively, [read my humble take on it](https://www.webstoemp.com/blog/switching-to-gulp4/).

## Gulp task

Let's move to creating our gulp task to resize our images.

### Required packages

We will need a few Node packages:

- [fs](https://nodejs.org/api/fs.html): to interact with the file system
- [glob](https://www.npmjs.com/package/glob): use glob patterns to find files and return them
- [path](https://nodejs.org/api/path.html): node package to work with files and directories
- [sharp](https://github.com/lovell/sharp): sharp image manipulation package

```js
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const sharp = require("sharp");
```

We now have everything we need.

### Configuration array

Let's now create a configuration array of objects that will specify our source and destination folders for each transforms, along with our transform options for `sharp`.

```js
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
```

Using such an object makes it easy to add new image directories and transforms should we need them down the line. Copy one object, modify paths and options and you're good to go.

### Images resize task

We then need a Gulp task to get the images we need to resize from our `src` directories, apply the specified image manipulations using `sharp` and save them in the `dist` directories specified in our object.

```js
// resize images
function resizeImages(done) {
  // loop through configuration array of objects
  transforms.forEach(function (transform) {
    // if dist folder does not exist, create it with all parent folders
    if (!fs.existsSync(transform.dist)) {
      fs.mkdirSync(transform.dist, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }

    // glob all files
    let files = glob.sync(transform.src);

    // for each file, apply transforms and save to file
    files.forEach(function (file) {
      let filename = path.basename(file);
      sharp(file)
        .resize(transform.options)
        .toFile(`${transform.dist}/${filename}`)
        .catch((err) => {
          console.log(err);
        });
    });
  });
  done();
}

// exports (Common JS)
module.exports = {
  resize: resizeImages,
};
```

### Main Gulp file

Our main `gulpfile.js` will use that task in watchers and expose it to Gulp CLI, as part of a more complex task or not.

```js
// Packages
const gulp = require("gulp");

// import tasks
const img = require("./gulp-tasks/images.js");
const server = require("./gulp-tasks/browsersync.js");
// import other tasks here

// Watch files
function watchFiles() {
  gulp.watch("./src/assets/img/**/*", img.resize);
}

// compose tasks (massively simplified here)
const watch = gulp.parallel(watchFiles, server.init);
const build = img.resize;

// export tasks
exports.watch = watch;
exports.build = build;
```

## "Fast" is an understatement

For any project I have worked on lately, Sharp has proven to be the fastest and most flexible option available. If you like numbers, check out the [performance benchmarks available on their website](https://sharp.pixelplumbing.com/en/stable/performance/).

Just to give you an idea, all images and thumbnails for this website get generated in 38 milliseconds only. Depending on your requirements and the scale of your project, that `resizeImages` task could easily be made incremental, which would make it even faster.
