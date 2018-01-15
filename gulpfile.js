var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var useref = require('gulp-useref');
var browserSync = require('browser-sync').create();
var del = require('del');
var runSequence = require('run-sequence');

/*==================================
=            TASK: SASS            =
==================================*/

	gulp.task('sass', function(){
	  return gulp.src('app/scss/**/*.scss')
	    .pipe(sass()) // Converts Sass to CSS with gulp-sass
	    .pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
	});


/*=====  End of TASK: SASS  ======*/



/*====================================
=            TASK: USEREF            =
====================================*/

gulp.task('useref', function(){
	return gulp.src('app/*.html')
	.pipe(useref())
	.pipe(gulpIf('*.js', uglify()))
	// Minifies only if it's a CSS file
	.pipe(gulpIf('*.css', cssnano()))
	.pipe(gulp.dest('dist'))
});

/*=====  End of TASK: USEREF  ======*/



/*=========================================
=            TASK: BROWSERSYNC            =
=========================================*/

	gulp.task('browserSync', function() {
		browserSync.init({
			server: {
				baseDir: 'app'
			},
		})
	})

/*=====  End of TASK: BROWSERSYNC  ======*/



/*===================================
=            TASK: WATCH            =
===================================*/

	gulp.task('watch', ['browserSync', 'sass'], function(){
		gulp.watch('app/scss/**/*.scss', ['sass']);
		// Reloads the browser whenever HTML or JS files change
		gulp.watch('app/*.html', browserSync.reload);
		gulp.watch('app/js/**/*.js', browserSync.reload);

	})


/*=====  End of TASK: WATCH  ======*/



/*========================================
=            TASK: CLEAN DIST            =
========================================*/

	gulp.task('clean:dist', function() {
		return del.sync('dist');
	})

/*=====  End of TASK: CLEAN DIST  ======*/



/*===============================================
=            TASK: PREPARE FOR BUILD            =
===============================================*/

	gulp.task('fonts', function() {
		return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
	})
	gulp.task('images', function() {
		return gulp.src('app/images/**/*')
		.pipe(gulp.dest('dist/images'))
	})

/*=====  End of TASK: PREPARE FOR BUILD  ======*/



/*===================================
=            TASK: BUILD            =
===================================*/

	gulp.task('build', function (callback) {
		runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'],
			callback
		)
	})

	gulp.task('default', function (callback) {
		runSequence(['sass','browserSync', 'watch'],
			callback
		)
	})

/*=====  End of TASK: BUILD  ======*/
