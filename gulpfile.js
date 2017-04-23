'use strict';

// Load plugins
var gulp          = require('gulp');
var sass          = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var jshint        = require('gulp-jshint');
var stripdebug    = require('gulp-strip-debug');
var uglify        = require('gulp-uglify');
var rename        = require('gulp-rename');
var replace       = require('gulp-replace');
var concat        = require('gulp-concat');
var cssnano       = require('gulp-cssnano');
var plumber       = require('gulp-plumber');
var gutil         = require('gulp-util');
var base64        = require('gulp-base64');
var imagemin      = require('gulp-imagemin');
var svgstore      = require('gulp-svgstore');
var cp            = require('child_process');
var browsersync   = require('browser-sync').create();

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

//create random number for banner swap
//between min (inclusive) and max (exclusive)
var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// BrowserSync proxy
gulp.task('browser-sync', function() {
  browsersync.init({
    proxy: 'www.webstoemp.dev',
    port: 3000
  });
});

// Optimize Images task
gulp.task('img', function() {
  return gulp.src(['./img/**/*','!./img/svg_sprite/svgsprite.svg'])
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
  }))
  .pipe(gulp.dest('./img/'));
});

// CSS task
gulp.task('css', function() {
  return gulp.src('./scss/**/*.scss')
  .pipe(plumber({ errorHandler: onError }))
  .pipe(sass({ style: 'expanded' }))
  .pipe(gulp.dest('./css/'))
  .pipe(gulp.dest('./_site/css/'))
  .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
  .pipe(base64({ extensions:['svg'] }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(cssnano())
  .pipe(gulp.dest('./css/'))
  .pipe(gulp.dest('./_site/css/'))
  .pipe(browsersync.stream());
});

// Lint JS task
gulp.task('jslint', function() {
  return gulp.src('./js/modules/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'));
});

//Concatenate and Minify JS task
gulp.task('scripts', ['jslint'], function() {
  return gulp.src(['./js/modules/**/*.js','./js/vendors/svg4everybody.min.js'])
  .pipe(concat('webstoemp.js'))
  .pipe(gulp.dest('./js/'))
  .pipe(gulp.dest('./_site/js/'))
  .pipe(rename('webstoemp.min.js'))
  .pipe(stripdebug())
  .pipe(uglify())
  .pipe(gulp.dest('./js/'))
  .pipe(gulp.dest('./_site/js/'))
  .pipe(browsersync.stream());
});

// Display random image on homepage
gulp.task('bannerimage', function() {
  return gulp.src('./_includes/header.html')
  .pipe(replace(/siteheader__banner--([0-9]*)/g, 'siteheader__banner--' + getRandomInt(1,6)))
  .pipe(gulp.dest('./_includes/'));
});

// SVG sprite task
gulp.task('svgsprite', function () {
  return gulp.src('./img/svg_sprite/sources/*.svg')
  .pipe(svgstore())
  .pipe(rename("svgsprite.svg"))
  .pipe(gulp.dest('./img/svg_sprite/'));
});

// Jekyll w/ dependencies for production
gulp.task('jekyll-production', ['css', 'scripts'], function (done) {
  return cp.spawn('bundle', ['exec','jekyll','build'], {stdio: 'inherit'})
  .on('close', done);
});

// Jekyll
gulp.task('jekyll-build', function (done) {
  return cp.spawn('bundle', ['exec','jekyll','build'], {stdio: 'inherit'})
  .on('close', done);
});

// Rebuild Jekyll & reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browsersync.reload();
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch('./scss/**/*', ['css']);
  gulp.watch('./js/modules/**/*', ['scripts']);
  gulp.watch(['./_includes/**/*','./_layouts/**/*','./_posts/**/*','./_projects/**/*','./_pages/**/*'], ['jekyll-rebuild']);
});

// Tasks
gulp.task('default', ['css', 'scripts', 'jekyll-rebuild']);
gulp.task('build', ['jekyll-production']);
gulp.task('svg', ['svgsprite']);
gulp.task('images', ['img']);
