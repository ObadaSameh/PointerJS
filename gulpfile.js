var gulp = require('gulp')
    , uglify = require("gulp-uglify")
    , htmlreplace = require("gulp-html-replace")
    , clean = require('gulp-clean')
    , concat = require("gulp-concat");

var clean = require('gulp-clean');

gulp.task('clean', function () {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('copy-html', function () {
    gulp.src('./src/examples/*.html')
        .pipe(htmlreplace({ compile: '../js/pointer.min.js' }))
        .pipe(gulp.dest('./dist/html'));
});

gulp.task('minify-js', function () {
    var files = [
        './src/js/index.js',
        './src/js/utility.js',
        './src/js/capture.js',
    ];

    gulp.src(files) // path to your files
        .pipe(uglify())
        .pipe(concat('/js/pointer.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['copy-html', 'minify-js']);