src = './src'
dest = './build';

cssSrc = './src/**/*.{sass,scss,css}';
htmlSrc = './src/**/*.{pug,html}';
jsSrc = './src/**/*.js';

// Files that be synced over to dest.
// Files that match these will be deleted from dest if they don't exist in src.
assetSrc = './src/**/*.!(sass,scss,css,pug,html,js)';
assetExtensionsToIgnore = ['sass', 'scss', 'css', 'pug', 'html', 'js']

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');

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
const autoprefixer = require("gulp-autoprefixer");
gulp.task('css', () => {
    return gulp.src(cssSrc)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            // browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest))
});

const watchSass = require('gulp-watch-sass');
gulp.task('css:watch', () => {
    return watchSass(cssSrc)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            // browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest))
});

const babel = require('gulp-babel');
gulp.task('js', () => {
    return gulp.src(jsSrc)
        .pipe(sourcemaps.init())
		.pipe(babel({
            presets: ['env']
		}))
        .pipe(sourcemaps.write())
		.pipe(gulp.dest(dest))
});

gulp.task('js:watch', () => {
    return watch(jsSrc, {ignoreInitial: false})
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest))
});

const dirSync = require( 'gulp-directory-sync');
const minimatch = require('minimatch');
const path = require('path');
gulp.task('moveFiles', function() {
	return gulp.src(src)
		.pipe(dirSync(src, dest, {
            ignore: function( dir, file ) {
                filepath = path.join(dir, file)
                for (let i = 0; i < assetExtensionsToIgnore.length; i++) {
                    ext = assetExtensionsToIgnore[i];
                    if (filepath.endsWith(ext)) return true;
                }
                return false;
            },
            printSummary: true,
        }))
		.on('error', console.log);
});

gulp.task('moveFiles:watch', () => {
    gulp.series('moveFiles')
    return gulp.watch(assetSrc, gulp.series('moveFiles'))
})

const browserSync = require('browser-sync').create();
gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: dest,
        },
        files: './src',
        open: false,
    })
});

const exec = require('child_process').exec;
gulp.task('deploy', (cb) => {
    exec('git subtree push --prefix build origin gh-pages', (err, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        cb(err)
    })
})

gulp.task('watch', gulp.series('clean', 'css', gulp.parallel('css:watch', 'html:watch', 'js:watch')));
gulp.task('build', gulp.series('clean', 'css', 'html', 'js'));
gulp.task('dev', gulp.parallel('watch', 'server'));
gulp.task('default', gulp.task('dev'));
