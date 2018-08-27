'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var posthtml = require('gulp-posthtml');
var autoprefixer = require('autoprefixer');
var htmlmin = require('gulp-htmlmin');
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var include = require('posthtml-include');
var run = require('run-sequence');
var del = require('del');
var uglify = require('gulp-uglify');
var server = require('browser-sync').create();

gulp.task('style', function () {
  gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('docs/css'))
    .pipe(server.stream())
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('docs/css'))
});

gulp.task('gulp-uglify', function () {
  gulp.src('source/js/script.js')
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('docs/js'))
});

gulp.task('images', function () {
  return gulp.src(['source/img/**/*.{png,jpg,svg}', '!source/img/sprite.svg'])
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('docs/img'));
});

gulp.task('webp', function () {
  return gulp.src(['source/img/**/*.{png,jpg}', '!source/img/favicon/**'])
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('docs/img'));
});

gulp.task('html', function () {
  return gulp.src('source/*html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('docs'));
});

gulp.task('minify', function () {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('docs'));
});

gulp.task('js', function () {
  return gulp.src('source/js/*.js')
    .pipe(gulp.dest('docs/js'));
});

gulp.task('serve', function () {
  server.init({
    server: 'docs/',
    notify: false,
    open: false,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', ['style']);
  gulp.watch('source/js/*.js', ['js']).on('change', server.reload);
  gulp.watch('source/*.html', ['html']).on('change', server.reload);
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source/js/**'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('docs'));
});

gulp.task('clean', function () {
  return del('docs');
});

gulp.task('build', function (done) {
  run(
    'clean',
    'copy',
    'style',
    // 'gulp-uglify',
    // 'images',
    // 'webp',
    'html',
    // 'minify',
    done
  );
});
