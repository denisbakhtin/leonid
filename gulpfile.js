/// <binding ProjectOpened='build-watcher' />
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    //babel = require('gulp-babel'),
    autoprefixer = require('gulp-autoprefixer'),
    rimraf = require('rimraf'),

    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    babel = require('babelify');

/*********************************************************************
 * Paths Set Up
 *********************************************************************/
var dest = "./public/";
var paths = {
    externalJs: [
        "./bower_components/jquery/dist/jquery.js",
        "./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js",
        "./bower_components/mithril/mithril.js"
    ],
    js: [
        './assets/js/main.js'
        // for all files use: './assets/js/**/*.js'*/
    ],
    jsEntry: './assets/js/main.js',
    css : [
        "./bower_components/font-awesome/css/font-awesome.css",
        "./bower_components/animate.css/animate.css",
        './assets/scss/main.scss'
    ],
    images: './assets/images/**/*',
    fonts: "./bower_components/font-awesome/fonts/*",
    jsDest: dest + "js",
    cssDest: dest + "css",
    fontsDest: dest + "fonts",
    imagesDest: dest + "images"
};


/*********************************************************************
 * Tasks
 *********************************************************************/

// Clean (optional)
gulp.task('clean-css', function (cb) {
    return rimraf(paths.cssDest, cb);
});
gulp.task('clean-js', function (cb) {
    return rimraf(paths.jsDest, cb);
});
gulp.task('clean-fonts', function (cb) {
    return rimraf(paths.fontsDest, cb);
});
gulp.task('clean-images', function (cb) {
    return rimraf(paths.imagesDest, cb);
});

gulp.task('clean-build', ['clean-css', 'clean-js', 'clean-fonts', 'clean-images']);

// Fonts
gulp.task('fonts', function () {
    return gulp.src(paths.fonts)
            .pipe(gulp.dest(paths.fontsDest));
});

//Images
gulp.task('images', function () {
    return gulp.src(paths.images)
            .pipe(gulp.dest(paths.imagesDest));
});

// External libs
gulp.task('build-external-js', function () {
    return gulp.src(paths.externalJs).pipe(concat('vendor.js')).pipe(gulp.dest(paths.jsDest));
});
//gulp.task('build-external-css', function () {
//    return gulp.src(paths.externalCss).pipe(concat('bootstrap.css')).pipe(gulp.dest(paths.cssDest));
//});

// JavaScript application & css
gulp.task('build-js', function () {
    return browserify(paths.jsEntry, { debug: true })
            .transform("babelify", { presets: ["es2015"] })
            .bundle()
            .on('error', function (err) { console.error(err); this.emit('end'); })
            .pipe(source('build.js'))
            .pipe(buffer())
            .pipe(concat('app.js'))
            .pipe(gulp.dest(paths.jsDest));
});

gulp.task('build-css', function () {
    return gulp.src(paths.css)
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(concat('app.css'))
            .pipe(gulp.dest(paths.cssDest));
});

/*********************************************************************
 * Build
 *********************************************************************/
gulp.task('prepare', ['build-external-js', 'build-css', 'build-js', 'fonts', 'images']);
gulp.task('build', ['prepare']);

/*********************************************************************
 * Watchers
 *********************************************************************/
gulp.task('build-watcher', ['clean-build', 'build'], function () {
    //gulp.watch(['./Scripts/**/*.js', './Styles/**/*.scss'], ['build']);
    gulp.watch(['./assets/js/**/*.js'], ['build-js']);
    gulp.watch(['./assets/scss/**/*.scss'], ['build-css']);
});

gulp.task('default', ['build'])
