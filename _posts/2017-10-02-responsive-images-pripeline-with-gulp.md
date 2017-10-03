---
title: "Build a responsive image pipeline with gulp"
excerpt: "I have been working with static site generators a lot lately. One thing I missed is a configurable image pipeline to automate the process of creating thumbnails for responsive images and the likes, so I looked into building one with Gulp."
categories:
- Front end
tags:
- Gulp
- Images
- Static
- Responsive
---

Over the last year or so, I have really become a fan of using static site generators for prototyping or even for full blown websites. This [JAMstack](https://jamstack.org/) thing is growing on me, but I wanted a way to deal with responsive images and thumbnails generation as part of the build process.

I have never been stellar at JavaScript and generally work with people that are a lot better at it than myself. But, even if I consider myself a bit slow, I enjoy like writing JS code to solve problems and I wanted to get more aquainted with ES6 syntax, which you can do with Gulp as of version 3.9.

Here is what I wanted these Gulp tasks to do for me:

- Copy and optimise images form `src` to `dist` only if images in `src` are newer than images in `dist`.
- Use a simple configuration array of objects to generate and optimise image thumbnails for selected folders in `src` using ImageMagick.
- Delete images and related thumbnails in my `dist` folder when images are deleted from `src` folder
- Delete usused folders in my `dist` folder when transform objects are modified in the configuration array or when `src` images are moved around.

Let's get to work.

## Packages and configuration

Apart from Gulp itself, we will need a few packages to accomplish this:

- [del](https://www.npmjs.com/package/del): delete files and folders
- [deleteEmpty](https://www.npmjs.com/package/delete-empty): delete empty folders recursively
- [globby](https://www.npmjs.com/package/globby): match files and folders using globs and expose a Promise API
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin): minify images
- [gulp-image-resize](https://www.npmjs.com/package/gulp-image-resize): resize images using ImageMagick
- [gulp-newer](https://www.npmjs.com/package/gulp-newer): only pass through source files newer tha destination files
- [merge2](https://www.npmjs.com/package/merge2): merge multiple streams into one stream in sequence or parallel (we will use the arallel option for performance)

After installing these packages with NPM, we need to declare them at the top of our gulpfile.js file.

```js
const del = require("del");
const deleteEmpty = require("delete-empty");
const globby = require("globby");
const gulp = require("gulp");
const gulpImagemin = require("gulp-imagemin");
const gulpImageresize = require("gulp-image-resize");
const gulpNewer = require("gulp-newer");
const merge2 = require("merge2");
```

To configure image transforms, we simply use an array of objects:

```js
const transforms = [
  {
    src: "./assets/img/blogposts/*",
    dist: "./public/assets/img/blogposts/",
    params: {
      width: 800,
      height: 600,
      crop: true
    }
  },
  {
    src: "./assets/img/banners/*",
    dist: "./public/assets/img/banners/",
    params: {
      width: 1500,
      height: 844,
      crop: true
    }
  }
];
```

Now that we have everything we need, let's tackle our objectives one by one.

## Copy and optimise source images

First, let's simply copy our `src` images our `dist` folder and optimise them. We want that operation to be incremental and only target images in `src` that are newer than the files already sitting in our `dist` folder. To do this, we simply use `gulp-newer` and feed it the path to our `dist` folder, the same one we feed to `gulp.dest`.

Job done. Gulp only copies new or modified images to our `dist` folder. We'll come back to that `img:clean` task we specify as a dependency a bit later.

```js
/**
 * Copy original images
 * - check if images are newer than existing ones
 * - if they are, optimise and copy them
 * - ignore (empty) directories
 */

gulp.task("img:copy", ["img:clean"], () => {
  return gulp.src("./assets/img/**/*", { nodir: true })
    .pipe(gulpNewer("./public/assets/img/"))
    .pipe(gulpImagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }, { removeUselessStrokeAndFill: false }]
    }))
    .pipe(gulp.dest("./public/assets/img/"));
});
```

## Create thumbnails

Next, we want to create our thumbnails using ImageMagick. If we only had one image folder to deal with, it would be a trivial task: pipe the images through `gulp-newer`, then through `gulp-image-resize` and finally through `gulp-imagemin`.

Here, we have to walk over our configuration array and, for each transform, repeat these operations. If possible, we also want to do it in parallel to optimise our build process.

That's what we use `merge2` for. We can use it to merge various streams. If we feed it an array of streams, it will process them in parallel.

```js
/**
 * Make thumbnails
 * 1. walk transforms array to build an array of streams
 *    - get src images
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
```

Our thumbnails are generated in subdirectories. They have the same filenames as the original images they are created from and we store them in subfolder named after the following pattern: "thumbs_[width]x[height]".

For example, if we configure a transform to generate "800" per "600" thumbnails for images in `src/assets/images/blogposts`, the generated thumbnails will be stored in `dist/assets/images/blogposts/thumbs_800x600/`.

## Clean thumbnails

Here comes the trickier part. Whenever an image in `src` is deleted, moved or renamed, we need to get rid of both the base image and the relevant generated thumbnails in `dist`.

Because our thumbnails and base images have the same filename, just different paths, we can simply compare the filenames of all images in `dist`, base images and thumbnails alike, with the filenames of our images in `src`. If we don't find a match, we know we can safely delete those files from `dist`.

Looping over a large amount of files and filtering paths can take quite some time, so we do it step by step using `globby` and promises.

```js
/**
 * Clean images
 * 1. get arrays of filepaths in images src (base images) and dist (base images and thumbnails)
 * 2. Diffing process
 *    - build list of filepaths in src
 *    - loop through filepaths in dist, remove dist and thumbnails specific parts
 *      to get both base images and corresponding thumbnails, compare with filepaths in src
 *    - if no match, add full dist image filepath to delete array
 * 3. Delete files (base images and thumbnails)
 */

gulp.task("img:clean", ["img:clean:directories"], () => {

  // get arrays of src and dist filepaths (returns array of arrays)
  return Promise.all([

    globby("./assets/img/**/*", { nodir: true }),
    globby("./public/assets/img/**/*", { nodir: true })

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
      // if not, add the full path to the distFilesToDelete array
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
```

That `img:clean` task and its dependencies are called systematically before thumbnails are generated and before `src` images are copied to `dist`.

## Clean unused thumbnail folders

We might modify our array of transform objects or delete or move all images in a given folder. To keep things nice and tidy, we need to get rid of those useless folders and thumbnails potentially remaining in our `dist` folder. That's what the `img:clean:directories` task does.

Using the tried and trusted `globby` package, we simply loop though all thumbnails folders in `dist` (that's quite easy since they all use the same generated names), compare them with the array of objects we use to configure all our transforms, and get rid of all the folders that are not in use anymore.

For good measure, we also get rid of all empty images directories lying around in our `dist` folder.

```js
/**
 * Clean unused directories
 * 1. Diffing process between src and dist for images and thumbnails
 *    - Build array of all thumbs_xxx directories that should exist using the transforms map
 *    - Build array of all thumbs_xxx directories in img dist
 *    - Diffing: array of all unused thumbnails directories in dist
 * 2. Delete files
 * 3. Delete all empty folders in dist images
 */

gulp.task("img:clean:directories", () => {
  globby("./public/assets/img/**/thumbs_+([0-9])x+([0-9])/")
    .then((paths) => {

      console.log("All thumbs folders: " + paths);

      // existing thumbs directories in dist
      const distThumbsDirs = paths;

      // create array of dirs that should exist by walking transforms map
      const srcThumbsDirs = transforms.map((transform) => transform.dist + "thumbs_" + transform.params.width + "x" + transform.params.height + "/");

      // array of dirs to delete
      const todeleteThumbsDirs = distThumbsDirs.filter((el) => srcThumbsDirs.indexOf(el) === -1);

      console.log("To delete thumbs folders: " + todeleteThumbsDirs);

      // pass array to next step
      return todeleteThumbsDirs;

    })
    .then((todeleteThumbsDirs) => {

      // deleted diff thumbnails directories
      del.sync(todeleteThumbsDirs);

    })
    .then(() => {

      // delete empty directories in dist images
      deleteEmpty.sync("./public/assets/img/");

    })
    .catch((error) => {

      console.log(error);

    });
});
```

## Create tasks

Finally, we just need to be able to group those tasks under one name for convenience and to setup our watch task.

```js
/**
 * We just need img:copy and img:thumbnails.
 * All other tasks are dependencies
 */

gulp.task("img", ["img:copy", "img:thumbnails"]);

/**
 * watch task
 */

gulp.task("watch", ["browser-sync"], () => {
  gulp.watch(["assets/img/**/*"], ["img"]);
});
```

## A nice little image pipeline

With a few line of JS, we have a small but powerfull image pipeline built with Gulp and Node that can be used with pretty much any static site generator on the market. Sure, services like [Cloudinary](https://cloudinary.com) and [imgIX](https://www.imgix.com/) are great but they are overkill for most of the projects I work on and introduce another dependency. I also gave me the opportunity to write some more ES6 and to work with Promises.

This series of Gulp tasks should be able to deal with even a large amount of images and is pretty easy to customise to suit your needs if you feel so inclined.

Thanks for reading and don't hesitate to hit me up if you have remarks or comment. [Here is the full file as a Gist](https://gist.github.com/jeromecoupe/dbda0e037f2fee9e0026dfb38fbc5e73) for reference.
