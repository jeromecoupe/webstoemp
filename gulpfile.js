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
};

// Browser definitions for autoprefixer
var AUTOPREFIXER_BROWSERS = [
	'last 3 versions',
	'ie >= 8',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

//build datestamp for cache busting
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
		files: ['./_site/**/*.css'],
		proxy: 'www.webstoemp.dev',
		port: 3000
	});
});

// BrowserSync reload all Browsers
gulp.task('browsersync-reload', function () {
  browsersync.reload();
});

// Optimize Images task
gulp.task('img', function() {
	return gulp.src('./img/**/*')
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [ {removeViewBox:false} ]
	}))
  .pipe(gulp.dest('./img/'))
});

// CSS task
gulp.task('css', function() {
	return gulp.src('./scss/**/*.scss')
	.pipe(plumber({ errorHandler: onError }))
	.pipe(sass({ style: 'expanded', }))
	.pipe(gulp.dest('./css/'))
	.pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
	.pipe(base64({ extensions:['svg'] }))
	.pipe(rename({ suffix: '.min' }))
	.pipe(minifycss())
	.pipe(gulp.dest('./css/'))
	.pipe(notify({ message: 'Styles task complete' }));
});

// Lint JS task
gulp.task('jslint', function() {
	return gulp.src('./js/modules/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(jshint.reporter('fail'))
	.pipe(notify({ message: 'Lint task complete' }));
});

//Concatenate and Minify JS task
gulp.task('scripts', function() {
	return gulp.src('./js/modules/**/*.js')
	.pipe(concat('webstoemp.js'))
	.pipe(gulp.dest('./js/'))
	.pipe(rename('webstoemp.min.js'))
	.pipe(stripdebug())
	.pipe(uglify())
	.pipe(gulp.dest('./js/'))
	.pipe(notify({ message: 'Scripts task complete' }));
});

// Cache busting task
gulp.task('cachebust', function() {
	return gulp.src('./_includes/**/*.html')
	.pipe(replace(/screen.min.css\?v=([0-9]*)/g, 'screen.min.css?v=' + getStamp()))
	.pipe(replace(/print.min.css\?v=([0-9]*)/g, 'print.min.css?v=' + getStamp()))
	.pipe(replace(/webstoemp.min.js\?v=([0-9]*)/g, 'webstoemp.min.js?v=' + getStamp()))
	.pipe(gulp.dest('./_includes/'))
	.pipe(notify({ message: 'CSS/JS Cachebust task complete' }));
});

// Watch task
gulp.task('watch', ['browser-sync'], function () {
	gulp.watch('./scss/**/*', ['css', 'cachebust']);
	gulp.watch('./js/modules/**/*', ['jslint', 'scripts', 'cachebust']);
});

//tasks
gulp.task('default', ['css', 'jslint', 'scripts', 'cachebust']);
gulp.task('images', ['img']);
