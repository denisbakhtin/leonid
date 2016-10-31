/// <binding ProjectOpened='build-watcher' />
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    rimraf = require('rimraf'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    babel = require('babelify'),
	reload = require('gulp-livereload'),
	util       = require('gulp-util'),
	notifier   = require('node-notifier'),
	child = require('child_process');

var sync = require('gulp-sync')(gulp).sync;
/*********************************************************************
 * Paths Set Up
 *********************************************************************/
var server = null;
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
 * Assets Tasks
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

gulp.task('clean-build', ['clean-css', 'clean-js', 'clean-images']);

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

gulp.task('assets:build', ['build-css', 'build-js']);
gulp.task('assets:watch', function () {
    gulp.watch(['./assets/js/**/*.js'], ['build-js']);
    gulp.watch(['./assets/scss/**/*.scss'], ['build-css']);
});

/* ----------------------------------------------------------------------------
 * Application server tasks
 * ------------------------------------------------------------------------- */

gulp.task('server:build', function() {
  var build = child.spawnSync('go', ['install']);
  if (build.stderr.length) {
    var lines = build.stderr.toString()
      .split('\n').filter(function(line) {
        return line.length
      });
    for (var l in lines)
      util.log(util.colors.red(
        'Error (go install): ' + lines[l]
      ));
    notifier.notify({
      title: 'Error (go install)',
      message: lines
    });
  }
  return build;
});

gulp.task('server:spawn', function() {
  if (server)
    server.kill();

  /* Spawn application server */
  server = child.spawn('leonid');

  /* Trigger reload upon server start */
  server.stdout.once('data', function() {
    reload.reload('/');
  });

  /* Pretty print server log output */
  server.stdout.on('data', function(data) {
    var lines = data.toString().split('\n')
    for (var l in lines)
      if (lines[l].length)
        util.log(lines[l]);
  });

  /* Print errors to stdout */
  server.stderr.on('data', function(data) {
    process.stdout.write(data.toString());
  });
});

gulp.task('server:watch', function() {

  gulp.watch([
    'views/**/*.html',
    'config/*.json'
  ], ['server:spawn']);

  gulp.watch([
    './**/*.go',
  ], sync([
    'server:build',
    'server:spawn'
  ], 'server'));
});

/*********************************************************************
 * Build
 *********************************************************************/
gulp.task('assets:prepare', ['build-external-js', 'build-css', 'build-js', 'fonts', 'images']);
gulp.task('build', ['assets:prepare', 'server:build']);

/*********************************************************************
 * Watchers
 *********************************************************************/
gulp.task('watch', ['clean-build', 'build', 'server:build'], function () {
    //gulp.watch(['./Scripts/**/*.js', './Styles/**/*.scss'], ['build']);
	reload.listen();
	return gulp.start([
		'assets:watch',
		'server:watch',
		'server:spawn'
	]);
});

gulp.task('default', ['build'])
