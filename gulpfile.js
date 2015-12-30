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
var notify        = require('gulp-notify');
var cssnano       = require('gulp-cssnano');
var plumber       = require('gulp-plumber');
var gutil         = require('gulp-util');
var base64        = require('gulp-base64');
var imagemin      = require('gulp-imagemin');
var svgstore      = require('gulp-svgstore');
var critical      = require('critical');
var cp            = require('child_process');
var browsersync   = require('browser-sync');

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
  browsersync({
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
  .pipe(gulp.dest('./img/'))
  .pipe(notify({ message: 'Images task done' }));
});

// Critical CSS
gulp.task('critical', function (cb) {
  critical.generate({
    base: './',
    inline: false,
    src: '_site/index.html',
    dest: '_includes/critical.css',
    minify: true,
    height: 1000
  });
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
  .pipe(browsersync.reload({stream:true}))
  .pipe(notify({ message: 'Styles task done' }));
});

// Lint JS task
gulp.task('jslint', function() {
  return gulp.src('./js/modules/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'))
  .pipe(notify({ message: 'Lint task done' }));
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
  .pipe(browsersync.reload({stream:true}))
  .pipe(notify({ message: 'Scripts task done' }));
});

// Display random image on homepage
gulp.task('bannerimage', function() {
  return gulp.src('./_includes/header.html')
  .pipe(replace(/siteheader__banner--([0-9]*)/g, 'siteheader__banner--' + getRandomInt(1,6)))
  .pipe(gulp.dest('./_includes/'))
  .pipe(notify({ message: 'Random banner for homepage done' }));
});

// SVG sprite task
gulp.task('svgsprite', function () {
  return gulp.src('./img/svg_sprite/sources/*.svg')
  .pipe(svgstore())
  .pipe(rename("svgsprite.svg"))
  .pipe(gulp.dest('./img/svg_sprite/'))
  .pipe(notify({ message: 'SVG sprite created' }));
});

// Jekyll build
gulp.task('jekyll-build', function (done) {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
  .on('close', done);
})

// Rebuild Jekyll & reload
gulp.task('jekyll-rebuild', ['jekyll-build', 'critical'], function () {
    browsersync.reload();
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch('./scss/**/*', ['css']);
  gulp.watch('./js/modules/**/*', ['scripts']);
  gulp.watch(['./_posts/**/*','./_projects/**/*'], ['bannerimage']);
  gulp.watch(['_includes/**/*','_layouts/**/*','./_posts/**/*','./_projects/**/*','./about/**/*','./blog/**/*','./contact/**/*','./work/**/*','index.html'], ['jekyll-rebuild']);
});

// Tasks
gulp.task('default', ['css', 'jslint', 'scripts', 'bannerimage', 'jekyll-rebuild']);
gulp.task('images', ['img']);
gulp.task('svg', ['svgsprite']);
