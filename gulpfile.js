/* eslint global-require: 0, import/no-dynamic-require: 0 */

const path = require('path');

const gulp = require('gulp');
const clean = require('gulp-clean');
// const replace = require('gulp-replace');
const hash = require('gulp-hash');
const swPrecache = require('sw-precache');
const mergeStream = require('merge-stream');
const htmlmin = require('gulp-htmlmin');

const myPath = {
  app: path.resolve(__dirname, 'app'),
  public: path.resolve(__dirname, 'public'),
  dist: path.resolve(__dirname, 'dist'),
  nodeModules: path.resolve(__dirname, 'node_modules')
};

gulp.task('clean', function () {
  return gulp.src(myPath.dist).pipe(clean());
});

gulp.task('copy-public', function () {
  const index = gulp.src(path.join(myPath.dist, 'index.html'))
      .pipe(htmlmin({
        collapseBooleanAttributes:      true,
        collapseWhitespace:             true,
        removeAttributeQuotes:          true,
        removeComments:                 true, // Only if you don't use comment directives!
        removeEmptyAttributes:          true,
        // removeRedundantAttributes:      true,
        removeScriptTypeAttributes:     true,
        removeStyleLinkTypeAttributes:  true,
        keepClosingSlash:               true,
        customAttrCollapse:             /ng-class|ng-show|ng-if|show-status|spin/
      }))
      .pipe(gulp.dest(myPath.dist));

  const others = gulp.src([
    path.join(myPath.public, 'images', '**'),
    path.join(myPath.public, 'manifest.json'),
  ], { base: myPath.public })
      .pipe(gulp.dest(myPath.dist));

  return mergeStream(index, others);
});

gulp.task('copy-sw', function () {
  const vendor = gulp.src(path.join(myPath.nodeModules, 'sw-toolbox', 'sw-toolbox.js'))
      .pipe(gulp.dest(myPath.dist));

  const script = gulp.src(path.join(myPath.app, 'sw-toolbox-script.js'))
      .pipe(hash()) // Add hashes to the files' names
      .pipe(gulp.dest(myPath.dist)) // Write the renamed files
      .pipe(hash.manifest('assets-sw-toolbox.json', {
        deleteOld: true,
        sourceDir: myPath.dist
      })) // Switch to the manifest file
      .pipe(gulp.dest(myPath.dist)); // Write the manifest file

  return mergeStream(vendor, script);
});

gulp.task('generate-service-worker', ['copy'], function (callback) {
  const swtAssets = require(path.join(myPath.dist, 'assets-sw-toolbox.json'));

  const staticFileGlobs = [
    'images/*.{svg,png,jpg,gif}',
    'index.html',
    '*-app.js',
    '*-styles.css',
  ].map(function (v) {
    return path.join('dist', v);
  });

  const importScripts = [
    'sw-toolbox.js',
    swtAssets['sw-toolbox-script.js']
  ];

  swPrecache.write(path.join(myPath.dist, 'sw.js'), {
    staticFileGlobs,
    importScripts,
    stripPrefix: 'dist/'
  }, callback);
});

gulp.task('copy', ['copy-public', 'copy-sw']);

gulp.task('dist', ['copy', 'generate-service-worker']);
