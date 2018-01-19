var gulp					=	require('gulp');
var sass					=	require('gulp-sass');
var cssnano					=	require('gulp-cssnano');
var uglify					=	require('gulp-uglify');
var gulpIf					=	require('gulp-if');
var useref					=	require('gulp-useref');
var browserSync				=	require('browser-sync').create();
var del						=	require('del');
var spritesmith				=	require('gulp.spritesmith');
var imagemin				=	require('gulp-imagemin');
var buffer					=	require('vinyl-buffer');
var merge					=	require('merge-stream');
var runSequence				=	require('run-sequence');
var plumber					=	require('gulp-plumber');
var notify					=	require("gulp-notify");
var sourcemaps 				=	require('gulp-sourcemaps');

/*==================================
=            TASK: SASS            =
==================================*/

	gulp.task('sass', function(){
	  return gulp.src('app/scss/*.scss')
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title:    "Gulp Error",
					message:  "Error: <%= error.message %>",
					sound:    "Bottle"
				})(err);
				this.emit('end');
			}
		}))
		.pipe(sourcemaps.init())
	    .pipe(sass()) // Converts Sass to CSS with gulp-sass
		//.pipe(plumber.stop())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
	});


/*=====  End of TASK: SASS  ======*/


/*==========================================
=            TASK: SPRITE IMAGE            =
==========================================*/

	gulp.task('image-sprite', function () {
		// Generate our spritesheet
		var spriteData = gulp.src('app/images/sprites/*.png')
		.pipe(spritesmith({
			imgName: 'sprites.png',
			selector: "svg-%f",
			cssName: '_sprites.scss',
			imgPath: '../images/sprites.png',
			padding: 2,

			// Config For 2x images
			retinaSrcFilter: ['app/images/sprites/*@2x.png'],
			retinaImgName: 'sprite@2x.png',
			retinaImgPath: '../images/sprite@2x.png'

		}));

		// Pipe image stream through image optimizer and onto disk
		var imgStream = spriteData.img
			.pipe(plumber())
			.pipe(buffer())
	    	.pipe(imagemin())
			.pipe(gulp.dest('app/images/'))
			.pipe(browserSync.stream());

		// Pipe CSS stream through CSS optimizer and onto disk
		var cssStream = spriteData.css.pipe(gulp.dest('app/scss/sprite/'));

		return merge(imgStream, cssStream);
	});

/*=====  End of TASK: SPRITE IMAGE  ======*/



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
=            TASK: WATCH            =
===================================*/

gulp.task('watch', function(callback){

			runSequence(['image-sprite', 'sass', 'browserSync'], callback)


			gulp.watch('app/scss/**/*.scss', ['sass']);
			// Reloads the browser whenever HTML or JS files change
			gulp.watch('app/*.html', browserSync.reload);
			gulp.watch('app/js/**/*.js', browserSync.reload);
			gulp.watch('app/imgs/sprites/**/*.png', ['img-sprite']);

		})


	/*=====  End of TASK: WATCH  ======*/


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
