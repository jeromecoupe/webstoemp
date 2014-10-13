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

// Optimize Images task
gulp.task('img', function() {
	return gulp.src('./img/**/*.{gif,jpg,png}')
    .pipe(imagemin({
        progressive: true,
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

// Watch task
gulp.task('watch', function () {
	gulp.watch('./scss/**/*', ['css']);
	gulp.watch('./js/modules/**/*', ['jslint', 'scripts']);
});

//tasks
gulp.task('default', ['css', 'jslint', 'scripts']);
gulp.task('images', ['img']);