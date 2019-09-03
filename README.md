# kasper.space
v4 of my personal website. It uses the [YouTube Data API](https://developers.google.com/youtube/v3/), the [SoundCloud API](https://developers.soundcloud.com/) and the [GitHub GraphQL API](https://developer.github.com/v4/), as well as some cool [three.js](https://threejs.org/) animation.

![Screenshot](https://raw.githubusercontent.com/probablykasper/kasp.io/master/Screenshot.png)

# Dev Instructions
1. Install Node.js 8 (I recommend installing it using a version manager like [fnm](https://github.com/Schniz/fnm))
2. Run `npm install gulp-cli -g` to install dependencies
3. Run `npm install` to install dependencies

- `gulp`: Same as `gulp watch server`.
- `gulp build`: Deletes `/build`, compiles all pug/sass/js in `/src` except for `/src/lib`, copies everything else from `/src` into `/build`, autoprefixes css, adds sourcemaps to css/js.
- `gulp watch`: Build and watch for changes.
- `gulp server`: Starts dev server on localhost:3000.
- `gulp deploy`: Build and deploy to GitHub Pages (/docs folder)
