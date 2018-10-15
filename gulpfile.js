const openBrowserWhenDevServerStarts = true

const src = 'src'
const dest = 'build'
const deploy = 'docs'

const cssSrc = 'src/**/*.{sass,scss,css}'
const htmlSrc = 'src/**/*.{pug,html}'
const jsSrc = ['src/**/*.js', '!src/lib/**']

// Files that will be copied and updated and deleted over to dest.
// Note that if you run moveFiles or moveFiles:watch by itself, files won't be deleted.
const assetSrc = ['src/**/*.!(*sass|*scss|*css|*pug|*html|*js)', 'src/lib/**']

require('clarify')
const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')

const del = require('del')
gulp.task('clean', () => {
  return del(dest)
})

const pug = require('gulp-pug')
gulp.task('html', () => {
  return gulp.src(htmlSrc)
    .pipe(pug())
    .pipe(gulp.dest(dest))
})

const watch = require('gulp-watch')
const gulpWatchPug = require('gulp-watch-pug')
gulp.task('html:watch', () => {
  return gulp.src(htmlSrc)
    .pipe(watch(htmlSrc))
    .pipe(gulpWatchPug(htmlSrc, { delay: 100 }))
    .pipe(pug())
    .pipe(gulp.dest(dest))
})

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
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
})

const watchSass = require('gulp-watch-sass')
gulp.task('css:watch', () => {
  gulp.series('css')
  return watchSass(cssSrc)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      // browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
})

const babel = require('gulp-babel')
gulp.task('js', () => {
  return gulp.src(jsSrc)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env'],
      compact: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
})

gulp.task('js:watch', () => {
  return watch(jsSrc, { ignoreInitial: false })
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env'],
      compact: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
})

const path = require('path')
gulp.task('moveFiles', function () {
  return gulp.src(assetSrc)
    .pipe(gulp.dest(dest))
})

gulp.task('moveFiles:watch', () => {
  // gulp.series('moveFiles')
  return watch(assetSrc, { ignoreInitial: false })
    .on('add', (filepath) => {
      const srcRelativeFilepath = path.relative('', filepath)
      console.log('added file', srcRelativeFilepath)
      gulp.src(srcRelativeFilepath, { base: 'src' })
        .pipe(gulp.dest(dest))
    })
    .on('change', (filepath) => {
      const srcRelativeFilepath = path.relative('', filepath)
      console.log('updated file', srcRelativeFilepath)
      gulp.src(srcRelativeFilepath, { base: 'src' })
        .pipe(gulp.dest(dest))
    })
    .on('unlink', (filepath) => {
      const srcRelativeFilepath = path.relative('', filepath)
      const relativeFilepath = path.relative(src, filepath)
      console.log('deleted file', srcRelativeFilepath)
      del(path.join(dest, relativeFilepath))
    })
})

const browserSync = require('browser-sync').create()
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: dest
    },
    files: './src',
    open: openBrowserWhenDevServerStarts
  })
})

gulp.task('build', gulp.series('clean', 'css', 'html', 'js', 'moveFiles'))
gulp.task('watch', gulp.series('build', gulp.parallel('css:watch', 'html:watch', 'js:watch', 'moveFiles:watch')))
gulp.task('dev', gulp.parallel('watch', 'server'))
gulp.task('default', gulp.task('dev'))

const simpleGitPromise = require('simple-git/promise')()
const gitState = require('git-state')
// gulp.task('deploy', gulp.series('deployChecks', 'build'));
gulp.task('deploy', () => {
  return new Promise((resolve, reject) => {
    simpleGitPromise.fetch('.')
      .then((result) => {
        const repo = require('git-utils').open('.')
        const behind = repo.getAheadBehindCount().behind
        if (behind !== 0) { // there are new commits, aka time to pull
          throw new Error('Cannot deploy when local repo is not up to date')
        }
        gitState.check('.', (err, result) => {
          if (err) return Promise.reject(err)
          if (result.dirty !== 0) { // there are uncommitted files
            throw new Error('Cannot deploy when there are uncommitted changes.')
          }
          gulp.series('build')
          del.sync(deploy)
          gulp.src(dest)
            .pipe(gulp.dest(deploy))
            .on('end', () => {
              simpleGitPromise.commit('Deploy', deploy, {})
                .then(({ summary }) => {
                  if (summary.changes === 0 && summary.insertions === 0 && summary.deletions === 0) {
                    console.log('No changes to commit')
                  } else {
                    console.log('Deployed')
                  }
                  console.log('fuck off')

                  resolve()
                })
                .catch((err) => {
                  reject(err)
                })
            })
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
})
