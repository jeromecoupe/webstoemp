---
title: "Switching to Gulp 4"
excerpt: "Although I also use NPM scripts on some projects, I have a soft spot for Gulp, mainly for its streaming ability, speed and easy to read configuration files. I have recently moved to Gulp 4 and wanted to share my experience."
categories:
- Front end
tags:
- Gulp
- Build scripts
---

## The good and the bad with Gulp 3

What I really enjoy about Gulp is that you can leverage your Javascript chops to create your build script. As a front-ender this is just great. For the most part, you can also use ES6 syntax with Gulp natively now, which is a bonus.

Gulp is also quite fast, and its ability to use streams and to pipe operations one after another means you do not need much access to disk, which makes it quite fast compared to NPM scripts. It is also a lot better than webpack to handle static assets like CSS or images. I also find even complex `gulpfile.js` scripts easy to read and modify.

On the negative side, Gulp adds an abstraction between your scripts and the NPM packages and libraries you use. NPM scripts let you use the package directly, without the need to have it wrapped in a Gulp plugin. You are always able to use the latest version of the library or package and, in most cases, you just use the CLI coming with the tool you want to use.

Another pain point I have with it is that to clearly specify which tasks you want to run in sequence, and which ones you want to run in parallel, you had to fiddle with task dependencies or with plugins like `run-sequence`.

## Switching to Gulp 4

Here is a quick summary of the major changes I made to build scripts when migrating to [Gulp 4](https://github.com/gulpjs/gulp). I tried to keep changes to a minimum. Let's go over a simple gulpfile (the one used on this website) to see what changed. Here is [a gist with the whole file for reference](https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a).

### Modules, import and export

I didn't switch to ES6 modules (imports and exports) as they are not yet supported natively in Node. You can simply [use Babel as explained in the doc](https://github.com/gulpjs/gulp/tree/4.0#use-last-javascript-version-in-your-gulpfile) if you fancy doing that. Basically, I kept everything the same here, except swithing from `var` to `const`.

```js
const gulp = require("gulp");
```

I also don't use commonJs `exports` syntax to expose tasks to the CLI. Instead, I simply use `gulp.task` as explained below.

### Plain named functions and `gulp.task`

Instead of the traditional `gulp.task` we all use with version 3 to define our tasks, I use simple named functions with no dependencies. One thing to pay attention to is that, with Gulp 4, we need to explicitely signal task completion for each function. You can do that [in five ways](https://stackoverflow.com/a/36899424/1796281): return a stream, return a promise, callback, return a child process, return a RxJS observable. If you do not do it properly, you will get the infamous "Did you forget to signal async completion?" message in your console and the task will not complete.

Here are some examples of the functions I use on this very website. They use the most common ways to signal async completion.

```js
// BrowserSync (callback)
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./_site/"
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload (callback)
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets (returns a promise)
function clean() {
  return del(["./_site/assets/"]);
}

// Lint scripts (returns a stream)
function scriptsLint() {
  return gulp
    .src(["./assets/js/**/*", "./gulpfile.js"])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts (returns a stream)
function scripts() {
  return (
    gulp
      .src(["./assets/js/**/*"])
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig), webpack)
      .pipe(uglify())
      // folder only, filename is specified in webpack config
      .pipe(gulp.dest("./_site/assets/js/"))
      .pipe(browsersync.stream())
  );
}

// Jekyll (returns a child process)
function jekyll() {
  return cp.spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit" });
}
```

I then reference these functions using `gulp.task` to expose them to the CLI and give them a name. You can do other interesting things beside just naming them Some tasks, like `clean` for example, do not need to be exposed and are kept "private" only to be used in the context of other tasks.

```js
// expose 'scripts' task to CLI
gulp.task("js", gulp.series(scriptsLint, scripts));

// build task
gulp.task(
  "build",
  gulp.series(
    clean,
    gulp.parallel(css, images, jekyll, "js")
  )
);
```

### Newcomers for dependencies management

The biggest advantage of migrating to Gulp 4 for me is the addition of `gulp.series` and `gulp.parallel` used above. These two are giving us a lot more control on the order in which we want our tasks to be executed and are also a lot more explicit.

Since they can be nested it is a very straightforward and flexible dependency management system for our tasks.

## Conclusion

All in all, I really like Gulp 4 and its increased readability and flexibility. If you want to dive in a bit further, I wholeheartedly recommend Joe Zimmerman's "[The Complete-Ish Guide to Upgrading to Gulp 4](https://www.joezimjs.com/javascript/complete-guide-upgrading-gulp-4/)".
