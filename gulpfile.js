'use strict'

/**
 * @todo refactor
 * @todo move path to variable
 *
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

const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const notify = require('gulp-notify')
const less = require('gulp-less')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const cssmin = require('gulp-cssmin')
const imagemin = require('gulp-imagemin')
const clean = require('gulp-clean')
const autoprefixer = require('gulp-autoprefixer')
const browserify = require('browserify')
const watchify = require('watchify')
const gulpUtil = require('gulp-util')
const vinylBuffer = require('vinyl-buffer')
const vinylSourceStream = require('vinyl-source-stream')
const lodashAssign = require('lodash.assign')
const config = require('./common/config')
const serverConfig = require('./server/config')

const serverPort = config.serverPort
const isProd = config.isProd
const brwoserSyncPort = serverConfig.brwoserSyncPort
const browserSyncUrl = 'http://localhost:' + serverPort
const browserSyncOpt = {
  port: brwoserSyncPort,
  proxy: browserSyncUrl
}

/* ================================================================ Helper
 */

function handleError (err) {
  gulpUtil.log(err)

  const args = Array.prototype.slice.call(arguments)
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args)

  if (typeof this.emit === 'function') this.emit('end')
}

/* ================================================================ Js task
 */

const browserifyCustomOpt = {
  entries: ['./public/src/js/main.js'],
  debug: !isProd
}
const browserifyOpt = lodashAssign({}, watchify.args, browserifyCustomOpt)
const watchifyJs = watchify(browserify(browserifyOpt))

watchifyJs.on('update', bundle)
watchifyJs.on('log', gulpUtil.log)

function bundle () {
  if (isProd) {
    return watchifyJs.bundle()
      .on('error', gulpUtil.log.bind(gulpUtil, 'Browserify Error'))
      .pipe(vinylSourceStream('bundle.js'))
      .pipe(vinylBuffer())
      .pipe(uglify()).on('error', handleError)
      .pipe(gulp.dest('./public/dist/js'))
      .pipe(browserSync.stream({
        'once': true
      }))
  } else {
    return watchifyJs.bundle()
      .on('error', gulpUtil.log.bind(gulpUtil, 'Browserify Error'))
      .pipe(vinylSourceStream('bundle.js'))
      .pipe(vinylBuffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/dist/js'))
      .pipe(browserSync.stream({
        'once': true
      }))
  }
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
  if (isProd) {
    return gulp.src('./public/src/less/main.less')
      .pipe(less())
      .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
      .pipe(cssmin())
      .pipe(gulp.dest('./public/dist/css'))
      .pipe(browserSync.stream({
        'once': true
      }))
  } else {
    return gulp.src('./public/src/less/main.less')
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/dist/css'))
      .pipe(browserSync.stream({
        'once': true
      }))
  }
})

gulp.task('image', function () {
  if (isProd) {
    return gulp.src('./public/src/asset/image/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest('./public/dist/asset/image'))
  } else {
    return gulp.src('./public/src/asset/image/**/*')
      .pipe(gulp.dest('./public/dist/asset/image'))
  }
})

gulp.task('sound', function () {
  return gulp.src('./public/src/asset/sound/**/*')
    .pipe(gulp.dest('./public/dist/asset/sound'))
})

gulp.task('serve', function () {
  browserSync.init(browserSyncOpt)

  const watchOpt = {
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
