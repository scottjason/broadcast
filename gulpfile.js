'use strict';

var gulp = require('gulp');
var del = require('del');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var sourceFile = './client/scripts/app.js';
var destFolder = './dist/scripts';
var destFileName = 'app.js';
var nodemon = require('gulp-nodemon')


// Styles
gulp.task('styles', ['moveCss']);

gulp.task('moveCss', ['clean'], function() {
  gulp.src(['./client/styles/**/*.css'], {
      base: './client/styles/'
    })
    .pipe(gulp.dest('dist/styles'));
});

var bundler = watchify(browserify({
  entries: [sourceFile],
  debug: true,
  insertGlobals: true,
  cache: {},
  packageCache: {},
  fullPaths: true
}));

bundler.on('update', rebundle);
bundler.on('log', $.util.log);

function rebundle() {
  return bundler.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(destFileName))
    .pipe(gulp.dest(destFolder))
    .on('end', function() {
      console.log("Rebundled.")
    });
}

// Scripts
gulp.task('scripts', rebundle);

gulp.task('buildScripts', function() {
  return browserify({
      entries: [sourceFile],
      transform: ['babelify']
    })
    .bundle()
    .pipe(source(destFileName))
    .pipe(gulp.dest('dist/scripts'));
});


// Views
gulp.task('html', function() {
  return gulp.src('client/*.html')
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

// JS Lib
gulp.task('jsLib', function() {
  return gulp.src('client/lib/scripts/*.js')
    .pipe($.useref())
    .pipe(gulp.dest('dist/lib/scripts/'))
    .pipe($.size());
});

// Images
gulp.task('images', function() {
  return gulp.src('client/assets/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

// Fonts
gulp.task('fonts', function() {

  return gulp.src(require('main-bower-files')({
      filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat('client/assets/fonts/**/*'))
    .pipe(gulp.dest('dist/assets/fonts'));

});


// Clean
gulp.task('clean', function(cb) {
  $.cache.clearAll();
  cb(del.sync(['dist/styles', 'dist/scripts', 'dist/assets/images']));
});

// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function() {
  return gulp.src('./client/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries', 'bower'], function() {
  return gulp.src('./client/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

// Move JS Files and Libraries
gulp.task('moveLibraries', ['clean'], function() {
  gulp.src(['./client/scripts/**/*.js'], {
      base: './client/scripts/'
    })
    .pipe(gulp.dest('dist/scripts'));
});

// Bower
gulp.task('bower', function() {
  gulp.src('client/bower_components/**/*.js', {
      base: 'client/bower_components'
    })
    .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('json', function() {
  gulp.src('client/scripts/json/**/*.json', {
      base: 'client/scripts'
    })
    .pipe(gulp.dest('dist/scripts/'));
});

// Robots.txt and favicon.ico
gulp.task('extras', function() {
  return gulp.src(['client/*.txt', 'client/*.ico'])
    .pipe(gulp.dest('dist/'))
    .pipe($.size());
});

// Watch
gulp.task('watch', ['html', 'jsLib', 'fonts', 'bundle', 'nodemon'], function() {
  gulp.watch('client/scripts/**/*.json', ['json']);
  gulp.watch('client/*.html', ['html']);
  gulp.watch(['client/styles/**/*.css'], ['styles', 'scripts']);
  gulp.watch('client/images/**/*');
});

// Nodemon
gulp.task('nodemon', function(cb) {

  var isStarted = false;

  return nodemon({
    script: 'server/app.js'
  }).on('start', function() {
    if (!isStarted) {
      cb();
      isStarted = true;
    }
  });
});

// Build
gulp.task('build', ['html', 'buildBundle', 'images', 'fonts', 'extras'], function() {
  gulp.src('dist/scripts/client.js')
    .pipe($.uglify())
    .pipe($.stripDebug())
    .pipe(gulp.dest('dist/scripts'));
});

// Default task
gulp.task('default', ['clean', 'build']);
