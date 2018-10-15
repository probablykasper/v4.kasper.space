# kasp.io
My personal website. It uses the [YouTube Data API](https://developers.google.com/youtube/v3/) and the [SoundCloud API](https://developers.soundcloud.com/), as well as some cool [three.js](https://threejs.org/) animation.

![Screenshot](https://raw.githubusercontent.com/SpectralKH/personal-website/master/Screenshot.pngx)

# Dev Instructions
1. Install Node.js
2. Run `npm install gulp-cli -g` to install dependencies
2. Run `npm install` to install dependencies

- `gulp build`: Build `/src` into `/build`. It deletes `/build`, copies everything from `/src` into `/build`, compiles pug/sass/es6, autoprefixes css and adds sourcemaps to css/js.
- `gulp watch`: Build and watch for changes.
- `gulp server`: Starts dev server on localhost:3000.
- `gulp dev` or just `gulp`: In case you don't want to type `gulp watch server`.
- `gulp deploy`: Build and deploy to GitHub Pages (by copying `/build` into the gh-pages branch).
