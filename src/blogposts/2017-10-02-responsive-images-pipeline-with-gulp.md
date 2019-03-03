---
title: "Building a simple responsive images pipeline with Gulp"
excerpt: "I have been working with static site generators a lot lately. One thing I missed is a configurable image pipeline to automate the process of creating thumbnails for responsive images and the likes, so I looked into building one with Gulp."
image: "images-pipeline.jpg"
imageAlt: "Big pipe - Photo by Erlend Ekseth"
tags:
- Front-end
- Gulp
- Images
- Static
- Responsive web design
---

Over the last year or so, I have really become a fan of using static site generators for prototyping or even for full blown websites. This [JAMstack](https://jamstack.org/) thing is growing on me, but I wanted a way to deal with responsive images and thumbnails generation as part of the build process.

Generating all these thumbnails on every build is time consuming, so I wanted something working incrementally. It is also nice to have a central place where you can configure all the image transforms you need. Finally, I wanted something clean that keeps my `dist` folder free of cruft.

Here is what I wanted these Gulp tasks to do for me:

1. Copy and optimise images form `src` to `dist` only if images in `src` are newer than images in `dist`.
2. Use a simple configuration array of objects to generate and optimise image thumbnails for selected folders in `src` using ImageMagick.
3. Delete images and related thumbnails in my `dist` folder when images are deleted from the `src` folder or renamed.
4. Delete unused folders in my `dist` folder when transform objects are modified in the configuration array or when images in `src` are moved around.

Let's get to work.

## Packages and configuration

Apart from Gulp itself, we will need a few packages to accomplish this:

- [del](https://www.npmjs.com/package/del): delete files and folders
- [deleteEmpty](https://www.npmjs.com/package/delete-empty): delete empty folders recursively
- [globby](https://www.npmjs.com/package/globby): match files and folders using globs and expose a Promise API
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin): minify images
- [gulp-image-resize](https://www.npmjs.com/package/gulp-image-resize): resize images using ImageMagick
- [gulp-newer](https://www.npmjs.com/package/gulp-newer): only pass through source files newer than destination files
- [merge2](https://www.npmjs.com/package/merge2): merge multiple streams into one stream in sequence or parallel (we will use the parallel option for performance)

After installing these packages with NPM, we need to import them at the top of our gulpfile.js file.

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

First, let's simply copy our `src` images into our `dist` folder and optimise them. We want that operation to be incremental and only target images in `src` that are newer than the files already sitting in our `dist` folder. To do this, we simply use `gulp-newer` and feed it the path to our `dist` folder. Job done. Gulp only copies new or modified images.

We'll come back to that `img:clean` task we specify as a dependency a bit later.

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

Next, we want to create our thumbnails using ImageMagick. If we only had one image folder to deal with, it would be a trivial task: pipe the images through `gulp-newer`, then through `gulp-image-resize` and finally through `gulp-imagemin` before saving the output to our `dist` folder.

Here, we have to walk over our configuration array and, for each transform, repeat these operations. If possible, we also want to do it in parallel to optimise our build process.

That's what `merge2` is used for. It merges multiple streams into one and, when fed an array of streams, processes them in parallel.

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

  // create empty streams array for merge2
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
          height: transform.params.height,
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

Our thumbnails have the same filenames as the original images and we store them in subfolders named after the following pattern: "thumbs_[width]x[height]".

For example, if we configure a transform to generate "800" per "600" thumbnails for images in `src/assets/images/blogposts`, the generated thumbnails will be stored in `dist/assets/images/blogposts/thumbs_800x600/`.

## Clean thumbnails

Here comes the trickier part. Whenever an image in `src` is deleted, moved or renamed, we need to get rid of both the base image and the relevant generated thumbnails in `dist`.

Because every image in our `dist` folder is generated or copied programatically, we can easily write a few lines of code to  compare their filepaths with the filepaths of original images in our `src` folder. If we don't find a match, we know we can safely delete those files from `dist`.

Looping over a large amount of files and filtering paths can take quite a few miliseconds (which is a long time in Gulp world). We make sure we wait for that process to happen before carrying on by using `globby` and promises.

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

That `img:clean` task and its dependencies are called systematically before thumbnails are generated as well as before `src` images are copied to `dist`.

## Clean unused thumbnail folders

We might modify our array of transform objects or delete or move all images in a given folder. To keep things tidy, we need to get rid of those useless folders potentially remaining in our `dist` folder. That's what the `img:clean:directories` task does.

Using the tried and trusted `globby` package, we simply loop though all thumbnails folders in `dist` (that's quite easy since they all use the same generated names), compare them with the array of objects we use to configure all our transforms, and get rid of all the folders that are not in use anymore.

For good measure, we also get rid of all empty thumbnails directories lying around in our `dist` folder.

```js
/**
 * Clean unused directories
 * 1. Diffing process between src and dist
 *    - Build array of all thumbs_xxx directories that should exist using the transforms map
 *    - Build array of all thumbs_xxx directories actually in dist
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

With a few line of JS, we have a small but powerfull image pipeline built with Gulp and Node that can be used with pretty much any static site generator on the market. Sure, services like [Cloudinary](https://cloudinary.com) and [imgIX](https://www.imgix.com/) are great but they are overkill for most of the projects I work on, and it also introduces another dependency. This small project also gave me the opportunity to write some ES6, to work with Promises and to prove once more than, indeed, [front-end is not programming](/blog/front-end-not-programming/).

This series of Gulp tasks should be able to deal with even a large amount of images and is pretty easy to customise to suit your needs if you feel so inclined.

Thanks for reading and don't hesitate to hit me up if you have remarks or comments. [Here is the full file as a Gist](https://gist.github.com/jeromecoupe/dbda0e037f2fee9e0026dfb38fbc5e73) for reference.
