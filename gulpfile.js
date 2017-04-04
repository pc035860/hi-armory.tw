var path = require('path');

var gulp = require('gulp');
var clean = require('gulp-clean');
var replace = require('gulp-replace');
var hash = require('gulp-hash');

var myPath = {
  public: path.resolve(__dirname, 'public'),
  dist: path.resolve(__dirname, 'dist'),
  clean: ['build/*']
};

gulp.task('clean', function () {
  return gulp.src(myPath.clean).pipe(clean());
});

gulp.task('hash:bundle', function () {
  return gulp.src(path.join(myPath.dist, 'bundle.js'))
  .pipe(hash()) // Add hashes to the files' names
  .pipe(gulp.dest(myPath.dist)) // Write the renamed files
  .pipe(hash.manifest('assets.json', {
    deleteOld: true,
    sourceDir: myPath.dist
  })) // Switch to the manifest file
  .pipe(gulp.dest(myPath.dist)); // Write the manifest file
});

gulp.task('index', ['hash:bundle'], function () {
  var assets = require(path.join(myPath.dist, 'assets.json'));
  return gulp.src(path.join(myPath.public, 'index.html'))
  .pipe(replace('bundle.js', assets['bundle.js']))
  .pipe(gulp.dest(myPath.dist));
});

gulp.task('dist', ['hash:bundle', 'index']);
