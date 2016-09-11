'use strict';

var gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  commonConfig = require('./common/config'),
  serverConfig = require('./server/config');

var serverPort = commonConfig.serverPort,
  brwoserSyncPort = serverConfig.brwoserSyncPort;

gulp.task('serve', function() {
  browserSync.init({
    'port': brwoserSyncPort,
    'proxy': 'http://localhost:' + serverPort,
    'open': true
  });

  var watchOpt = { interval: 500 };

  gulp.watch('./public/scripts/**/*.js',  watchOpt).on('change', browserSync.reload);
  gulp.watch('./public/styles/*.css',     watchOpt).on('change', browserSync.reload);
  gulp.watch('./public/index.html',       watchOpt).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
