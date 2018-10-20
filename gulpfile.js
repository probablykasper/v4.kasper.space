const openBrowserWhenDevServerStarts = true

const src = 'src'
const dest = 'build'
const deploySrc = 'build/**'
const deploy = 'docs'

const cssSrc = 'src/**/*.{sass,scss,css}'
const htmlSrc = 'src/**/*.{pug,html}'
const jsSrc = ['src/**/*.js', '!src/lib/**']

// Files that will be copied and updated and deleted over to dest.
// Note that if you run assets or assets:watch by itself, files won't be deleted.
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
  return watch(jsSrc, { ignoreInitial: true })
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env'],
      compact: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
})

const path = require('path')
gulp.task('assets', function () {
  return gulp.src(assetSrc, { base: src })
    .pipe(gulp.dest(dest))
})

gulp.task('assets:watch', () => {
  // gulp.series('assets')
  return watch(assetSrc, { base: src, ignoreInitial: true, read: false })
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
  return browserSync.init({
    server: {
      baseDir: dest
    },
    files: './src',
    open: openBrowserWhenDevServerStarts
  })
})

gulp.task('build', gulp.series('clean', 'css', 'html', 'js', 'assets'))
gulp.task('watch', gulp.series('build', gulp.parallel('css:watch', 'html:watch', 'js:watch', 'assets:watch')))
gulp.task('dev', gulp.series('build', gulp.parallel('css:watch', 'html:watch', 'js:watch', 'assets:watch', 'server')))
gulp.task('default', gulp.task('dev'))

const simpleGit = require('simple-git')()
const gitState = require('git-state')
gulp.task('deployChecks', (cb) => {
  simpleGit.fetch('.', (err, result) => {
    if (err) return cb(err)

    const repo = require('git-utils').open('.')
    const behind = repo.getAheadBehindCount().behind
    if (behind !== 0) { // there are new commits, aka time to pull
      return cb(new Error('Cannot deploy when local repo is not up to date.'))
    }
    gitState.check('.', (err, result) => {
      if (err) return cb(err)
      if (result.dirty !== 0) {
        return cb(new Error('Cannot deploy when there are uncommitted changes.'))
      }
      cb()
    })
  })
})
gulp.task('deploy', gulp.series('deployChecks', 'build', () => {
  return new Promise((resolve, reject) => {
    del.sync(deploy)
    gulp.src(deploySrc, { read: false })
      .pipe(gulp.dest(deploy))
      .on('end', () => {
        simpleGit.commit('Deploy', deploy, {}, (err, result) => {
          if (err) return reject(err)
          if (result === null || !result.summary) console.log('Could not commit anything')
          const summary = result.summary
          if (summary.changes === 0 && summary.insertions === 0 && summary.deletions === 0) {
            console.log('No changes to commit')
          } else {
            console.log('Deployed')
          }
          resolve()
        })
      })
  })
}))
