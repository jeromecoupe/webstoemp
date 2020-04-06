---
title: "My default Gulp setup for build automation"
excerpt: "I have switched from Grunt to Gulp to handle my build process. I love its simple syntax and the fact that you can easily use your JavaScript chops to simplify your life as a front-end developer."
image: "gulp.jpg"
imageAlt: "Gulp logo"
tags:
- Tooling
- Gulp
- BrowserSync
---

I use Gulp to compile Sass, add vendor prefixes to my CSS, optimise images and SVG, combine my Javascript files and optimise them, toast bread and make coffee in the morning, etc. If you want to [get started with it](http://travismaynard.com/writing/getting-started-with-gulp), I can only recommend you take a look at a [couple](http://markgoodyear.com/2014/01/getting-started-with-gulp/) of [articles](http://www.smashingmagazine.com/2014/06/11/building-with-gulp/).

For now, I just wanted to share my default gulpfile.js file with you.

## Full file

```javascript
'use strict';

// Load plugins
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var base64 = require('gulp-base64');
var imagemin = require('gulp-imagemin');
var browsersync = require('browser-sync');

// error function for plumber
var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

// Browser definitions for autoprefixer
var AUTOPREFIXER_BROWSERS = [
  'last 3 versions',
  'ie >= 8',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Datestamp for cache busting
var getStamp = function() {
  var myDate = new Date();

  var myYear = myDate.getFullYear().toString();
  var myMonth = ('0' + (myDate.getMonth() + 1)).slice(-2);
  var myDay = ('0' + myDate.getDate()).slice(-2);
  var mySeconds = myDate.getSeconds().toString();

  var myFullDate = myYear + myMonth + myDay + mySeconds;

  return myFullDate;
};

// BrowserSync proxy
gulp.task('browser-sync', function() {
  browsersync({
    proxy: 'www.webstoemp.dev',
    port: 3000
  });
});

// BrowserSync reload all Browsers
gulp.task('browsersync-reload', function () {
    browsersync.reload();
});

// Optimize Images task
gulp.task('images', function() {
  return gulp.src('./public_html/assets/img/**/*.{gif,jpg,png}')
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
    }))
    .pipe(gulp.dest('./public_html/assets/img/'))
});

// CSS task
gulp.task('css', function() {
  return gulp.src('./public_html/assets/scss/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass({ style: 'expanded', }))
    .pipe(gulp.dest('./public_html/assets/css/'))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(base64({ extensions:['svg'] }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./public_html/assets/css/'))
    .pipe(browsersync.reload({ stream:true }))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Lint JS task
gulp.task('jslint', function() {
  return gulp.src('./public_html/assets/js/modules/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(notify({ message: 'Lint task complete' }));
});

//Concatenate and Minify JS task
gulp.task('scripts', function() {
  return gulp.src('./public_html/assets/js/modules/*.js')
    .pipe(concat('webstoemp.js'))
    .pipe(gulp.dest('./public_html/assets/js/build'))
    .pipe(rename('webstoemp.min.js'))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest('./public_html/assets/js/build'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Cache busting task
gulp.task('cachebust', function() {
  return gulp.src('./craft/templates/_layouts/*.html')
    .pipe(replace(/screen.min.css\?([0-9]*)/g, 'screen.min.css?' + getStamp()))
    .pipe(replace(/print.min.css\?([0-9]*)/g, 'print.min.css?' + getStamp()))
    .pipe(replace(/webstoemp.min.js\?([0-9]*)/g, 'webstoemp.min.js?' + getStamp()))
    .pipe(gulp.dest('./craft/templates/_layouts/'))
    .pipe(notify({ message: 'CSS/JS Cachebust task complete' }));
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch('./public_html/assets/scss/**/*', ['css']);
  gulp.watch('./public_html/assets/js/modules/**/*', ['jslint', 'scripts', 'browsersync-reload']);
  gulp.watch('./craft/templates/**/*', ['browsersync-reload']);
});

// Generic tasks
gulp.task('default', ['css', 'jslint', 'scripts', 'cachebust']);
gulp.task('images', ['img']);
```

## Gulp plugins

You can find all of the plugins I am using on the [npm website](https://www.npmjs.org/). I will Just outline a few of the most useful:

- **[gulp-autoprefixer](https://www.npmjs.org/package/gulp-autoprefixer)**: the best thing since sliced bread. You only have to worry about write standard up to date CSS code. Based on an array of browsers, autoprefixer will write all your vendor prefixes and CSS variations for things like gradients or flexbox.
- **[gulp-minify-css](https://www.npmjs.org/package/gulp-minify-css)**: I like to have a non minified version of the CSS file generated by Sass to check everything is fine. This plugin will just minify that CSS before it goes in production.
- **[gulp-plumber](https://www.npmjs.org/package/gulp-plumber)**: This plugin will prevent your watch task from choking every time there is an error, forcing you to restart it. With plumber, it will notify you, but those watch tasks will continue running. Just [make sure you emit an end event in your callback](http://blog.ibangspacebar.com/handling-errors-with-gulp-watch-and-gulp-plumber/). If you do not, error will not cause crashes but your watch task will hang forever and you will have to restart it anyway.
- **[gulp-imagemin](https://www.npmjs.org/package/gulp-imagemin)**: Used to optimise images before they go into production.
- **[BrowserSync](http://www.browsersync.io/)**: Not a gulp plugin per se. Used to create a proxy server, perform CSS injections, reload your pages and sync clicks, form completions and scroll across multiple devices.

## Images

I use the gulp-imagemin plugin for optimising my images. It comes bundled with plugins to optimise jpg, gif and png so it suits most of my needs perfectly. The only options I use are for making progressive JPEG, interlaced GIFs and optimise SVG. Setting `removeViewBox` and `removeUselessStrokeAndFill` to `false` prevent SVGO from borking some complex SVG files.

``` javascript
// Optimize Images task
gulp.task('images', function() {
  return gulp.src('./public_html/assets/img/**/*.{gif,jpg,png}')
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
    }))
    .pipe(gulp.dest('./public_html/assets/img/'))
});
```

In case you need something else, [have a look on nmpjs.org](https://www.npmjs.org/browse/keyword/imageminplugin), you are bound to find a plugin fulfilling your wildest dreams about image optimisation.

I consider this a one shot task and, as such, I don't include it in my watch task.

## CSS

Generally, may main Sass file is just a bunch of imports and my partials live in separate folders so I watch the whole Scss folder of my project here. As far as CSS go, here are the tasks Gulp performs for me:

```javascript
// CSS task
gulp.task('css', function() {
  return gulp.src('./public_html/assets/scss/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass({ style: 'expanded', }))
    .pipe(gulp.dest('./public_html/assets/css/'))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(base64({ extensions:['svg'] }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./public_html/assets/css/'))
    .pipe(browsersync.reload({ stream:true }))
    .pipe(notify({ message: 'Styles task complete' }));
});
```

The first line tells gulp-plumber to enter the game and to prevent this task from quitting upon error. I frequently make typos in my CSS during development and don't want my watch tasks to stop every time.

```javascript
  .pipe(sass({ style: 'expanded', }))
  .pipe(gulp.dest('./public_html/assets/css/'))
```

This compile my Sass in expanded mode and save the file in my css/ folder.

```javascript
  .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
```

I then pipe in [Autoprefixer](https://github.com/postcss/autoprefixer). That tool allows me to focus on writing spec-compliant CSS code and takes care of adding in the vendor prefixes for me. It also generates the CSS variations for things like gradients or flexbox when multiple implementations have seen the light of day. I just find it easier to have all my autoprefixer browsers config out of the task itself.

```javascript
  .pipe(base64({ extensions:['svg'] }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(minifycss())
  .pipe(gulp.dest('./public_html/assets/css/'))
```

The first line encodes my SVG as base64. This will save some http requests. Make sure you have a .png fallback using Modernizr. I generally use this only for icons. Depending on the project, I might change this and have Gulp do the Base 64 encoding only on one or two of my sass files for more granularity.

I am considering moving to an inline SVG workflow using `<symbol>` in an external file to create SVG spritemaps for my next project. Chris Coyier has a [couple](https://css-tricks.com/svg-sprites-use-better-icon-fonts/) of [nice articles](https://css-tricks.com/svg-symbol-good-choice-icons/) detailing the process and [SVG for Everybody](https://github.com/jonathantneal/svg4everybody) is a polyfill by Jonathan Neal you can use to make it work across the board.

If that's what you want to do, [there is a gulp plugin for that](https://www.npmjs.org/package/gulp-svg-sprites).

The next three lines are generating two versions of my main CSS file, one compressed and ready for production and one expanded because I like to check what my Sass outputs from time to time.

## JavaScript

I have gulp run all my modules through jshint and then concatenate and minify all my scripts into one. I also remove all debug statements using `gulp-strip-debug`. That's all there is to it really.

## Cache busting for CSS and JS

If you set long browser cache expirations on your static files using expire headers, you will need some sort of cache busting method. The simplest one is to add query strings to every references to your CSS and JS files.

```html
<link rel="stylesheet" media="screen" href="css/screen.css">
```

becomes

```html
<link rel="stylesheet" media="screen" href="css/screen.css?2014100345">
```

Generating that query string every time your CSS or JS files are modified, is an easy way to override the browser cache. It is worth noting that Steve Souders advises you not to rev your files using query strings but rather using filenames for various reasons detailed [in a good article](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/).

Nevertheless, I went with query string, constructed my own timestamp as a query string and applied it using using the gulp-replace plugin.

```javascript
gulp.task('cachebust', function() {
  return gulp.src('./craft/templates/_layouts/*.html')
    .pipe(replace(/screen.min.css\?([0-9]*)/g, 'screen.min.css?' + getStamp()))
    .pipe(replace(/print.min.css\?([0-9]*)/g, 'print.min.css?' + getStamp()))
    .pipe(replace(/webstoemp.min.js\?([0-9]*)/g, 'webstoemp.min.js?' + getStamp()))
    .pipe(gulp.dest('./craft/templates/_layouts/'))
    .pipe(notify({ message: 'CSS/JS Cachebust task complete' }));
});
```

## Reload and CSS Injections

I've never worked with [LiveReload](http://livereload.com/) because I found dealing with a browser extension a bit of a pain, especially when you need to test with browsers for which there is no extension.

I have used [Vanamco's Ghostlab](http://vanamco.com/ghostlab/) (which I like a lot) but have recently discovered [BrowserSync](http://www.browsersync.io/) which does Live reloads, CSS injections and syncs clicks, form completions and scroll across multiple devices.

It's quite easy to install and to integrate to your Gulp workflow:

```javascript
// Browsersync server
gulp.task('browser-sync', function() {
  browsersync({
    proxy: 'www.webstoemp.dev',
    port: 3000
  });
});
```

This wraps my virtual host (www.webstoemp.dev) with a proxy URL allowing me to view my site.

```javascript
// BrowserSync reload all Browsers
gulp.task('browsersync-reload', function () {
  browsersync.reload();
});
```

Simple task to reload all browsers with BrowserSync (used when my HTML / Template or script files are modified).

```javascript
// Watch task
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch('./public_html/assets/scss/**/*', ['css']);
  gulp.watch('./public_html/assets/js/modules/**/*', ['jslint', 'scripts', 'browsersync-reload']);
  gulp.watch('./craft/templates/**/*', ['browsersync-reload']);
});
```

Here, I launch the BrowserSync task when my watch task starts and I force a browser reload every time one of my templates or scripts are modified.

BrowserSync will inject any new styles in my pages when my CSS files are modified because of this line in my CSS task:

```javascript
.pipe(browsersync.reload({ stream:true }))
```

Well, that's it. I just walked you through my current default setup for build automation with Gulp. I hope you found something useful in there. If you have suggestions or optimisations, don't hesitate to get in touch on twitter, I love to nerd out on such things.
