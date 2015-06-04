var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
	connect = require('gulp-connect');
	
gulp.task('sass', function() {
	return sass('public/sass/main.scss', { style: 'expanded' })
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('public/css'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifycss())
		.pipe(gulp.dest('public/css'))
		.pipe(connect.reload())
		.pipe(notify({ message: 'Finished sass -> css' }));
});

gulp.task('watch', function() {
	gulp.watch('public/sass/*.scss', ['sass']);
});