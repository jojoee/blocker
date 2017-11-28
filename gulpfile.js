'use strict'

/**
 * Task runner
 * - Js (Browserify)
 * - Less
 *
 * Why `vinyl-source-stream`
 * - http://stackoverflow.com/questions/30794356/why-do-i-have-to-use-vinyl-source-stream-with-gulp
 *
 * Reference
 * - https://github.com/BrowserSync/recipes/tree/master/recipes/gulp.browserify
 * - https://gist.github.com/neoziro/a834f55ba665a6b616b6
 * - https://gist.github.com/Falconerd/3acc15f93b6a023e43b9
 * - https://gist.github.com/Sigmus/9253068
 * - https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
 */

var gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  notify = require('gulp-notify'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  obfuscate = require('gulp-obfuscate'), // unused
  cssmin = require('gulp-cssmin'),
  rename = require('gulp-rename'), // unused
  imagemin = require('gulp-imagemin'),
  clean = require('gulp-clean'),
  autoprefixer = require('gulp-autoprefixer'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  gulpIf = require('gulp-if'),
  gulpUtil = require('gulp-util'),
  vinylBuffer = require('vinyl-buffer'),
  vinylSourceStream = require('vinyl-source-stream'),
  lodashAssign = require('lodash.assign'),
  config = require('./common/config'),
  serverConfig = require('./server/config')

var serverPort = config.serverPort,
  isProd = config.isProd,
  brwoserSyncPort = serverConfig.brwoserSyncPort,
  browserSyncUrl = 'http://localhost:' + serverPort,
  browserSyncOpt = {
    port: brwoserSyncPort,
    proxy: browserSyncUrl
  }

/* ================================================================ Helper
 */

function handleError (err) {
  gulpUtil.log(err)

  var args = Array.prototype.slice.call(arguments)
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args)

  if (typeof this.emit === 'function') this.emit('end')
}

/* ================================================================ Js task
 */

var browserifyCustomOpt = {
  entries: ['./public/src/js/main.js'],
  debug: !isProd
}
var browserifyOpt = lodashAssign({}, watchify.args, browserifyCustomOpt)
var watchifyJs = watchify(browserify(browserifyOpt))

watchifyJs.on('update', bundle)
watchifyJs.on('log', gulpUtil.log)

function bundle () {
  return watchifyJs.bundle()
    .on('error', gulpUtil.log.bind(gulpUtil, 'Browserify Error'))
    .pipe(vinylSourceStream('bundle.js'))
    .pipe(vinylBuffer())
    .pipe(gulpIf(!isProd, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(gulpIf(isProd, uglify())).on('error', handleError)
    .pipe(gulpIf(!isProd, sourcemaps.write('./')))
    .pipe(gulp.dest('./public/dist/js'))
    .pipe(browserSync.stream({
      'once': true
    }))
}

gulp.task('js', bundle)

/* ================================================================ Other tasks
 */

gulp.task('clean', function () {
  var cleanOpt = {
    read: false
  }

  return gulp.src('./public/dist/*', cleanOpt)
    .pipe(clean())
})

gulp.task('less', function () {
  return gulp.src('./public/src/less/main.less')
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(less())
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
    .pipe(gulpIf(!isProd, sourcemaps.write('./')))
    .pipe(gulpIf(isProd, cssmin()))
    .pipe(gulp.dest('./public/dist/css'))
    .pipe(browserSync.stream({
      'once': true
    }))
})

gulp.task('image', function () {
  return gulp.src('./public/src/asset/image/**/*')
    .pipe(gulpIf(isProd, imagemin()))
    .pipe(gulp.dest('./public/dist/asset/image'))
})

gulp.task('sound', function () {
  return gulp.src('./public/src/asset/sound/**/*')
    .pipe(gulp.dest('./public/dist/asset/sound'))
})

gulp.task('serve', function () {
  browserSync.init(browserSyncOpt)

  var watchOpt = {
    interval: 500
  }

  gulp.watch('./public/index.html', watchOpt).on('change', browserSync.reload)
  gulp.watch('./public/src/less/**/*.less', ['less'])
  gulp.watch('./public/src/asset/image/**/*', ['image'])
  gulp.watch('./public/src/asset/sound/**/*', ['sound'])
  gulp.watch('./public/src/js/main.js', ['js'])
})

// should run `clean` first
gulp.task('build', ['less', 'js', 'image', 'sound'], function () {
  watchifyJs.close()
})
gulp.task('watch', ['serve'])
gulp.task('default', ['build'])
