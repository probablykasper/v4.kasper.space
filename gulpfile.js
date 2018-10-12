const gulp = require('gulp');
// const changed = require('gulp-changed');
// const pug = require('gulp-pug');

cssSrc = './src/**/*.{sass,scss,css}';
htmlSrc = './src/**/*.pug';
jsSrc = './src/**/*.js';
dest = './build';

const del = require('del');
gulp.task('clean', () => {
    return del(dest)
});

const pug = require("gulp-pug");
gulp.task('html', () => {
    return gulp.src(htmlSrc)
        .pipe(pug())
        .pipe(gulp.dest(dest));
});

const watch = require('gulp-watch');
const gulp_watch_pug = require('gulp-watch-pug');
gulp.task('html:watch', () => {
    return gulp.src(htmlSrc)
        .pipe(watch(htmlSrc))
        .pipe(gulp_watch_pug(htmlSrc, { delay: 100 }))
        .pipe(pug())
        .pipe(gulp.dest(dest));
});


const sass = require("gulp-sass");
gulp.task('css', () => {
    return gulp.src(cssSrc)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(dest))
});

const watchSass = require('gulp-watch-sass');
gulp.task('css:watch', () => {
    return watchSass(cssSrc)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dest))
});

const babel = require('gulp-babel');
gulp.task('js', () =>
	gulp.src(jsSrc)
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(gulp.dest(dest))
);

gulp.task('watch', gulp.series('clean', 'css', gulp.parallel('css:watch', 'html:watch')));
gulp.task('build', gulp.series('clean', gulp.parallel('css', 'html')));
gulp.task('default', gulp.series('build'));
