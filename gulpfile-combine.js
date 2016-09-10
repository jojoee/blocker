'use strict';

var gulp = require('gulp'),
  browserSync = require('browser-sync'),
  nodemon = require('gulp-nodemon'),
  serverConfig = require('./server/config');

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500,
  serverPort = serverConfig.port,
  brwoserSyncPort = serverConfig.brwoserSyncPort;

gulp.task('nodemon', function(cb) {
  var called = false;

  return nodemon({
    script: 'app.js',
    watch: [
      'app.js',
      'server/*.js',
    ]
  })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync({
    proxy: 'http://localhost:' + serverPort,
    port: brwoserSyncPort,
  });
});

// unused
gulp.task('js',  function() {
  return gulp.src('public/scripts/*.js')
    // do stuff to JavaScript files
    //.pipe(uglify())
    //.pipe(gulp.dest('...'));
});

// unused
gulp.task('css', function() {
  return gulp.src('public/styles/*.css')
    .pipe(browserSync.reload({ stream: true }));
})

// unused
gulp.task('bs-reload', function() {
  browserSync.reload();
});

gulp.task('default', ['browser-sync'], function() {
  // gulp.watch('public/scripts/*.js', ['js', browserSync.reload]);
  // gulp.watch('public/styles/*.css', ['css']);
  // gulp.watch('public/index.html',   ['bs-reload']);
  
  gulp.watch('public/scripts/*.js', browserSync.reload);
  gulp.watch('public/styles/*.css', browserSync.reload);
  gulp.watch('public/index.html',   browserSync.reload);
});
