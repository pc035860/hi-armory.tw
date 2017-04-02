const { FuseBox, BabelPlugin } = require('fuse-box');


// Create FuseBox Instance
const fuse = new FuseBox({
  homeDir: 'app/',
  sourcemaps: true,
  outFile: './public/bundle.js',
  plugins: [
    BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        sourceMaps: true,
        presets: ['es2015', 'stage-2']
      },
    })
    // UglifyJSPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   sourceMap: true
    // })
  ],
  shim: {
    jquery: {
      exports: 'jQuery'
    }
  }
});

fuse.devServer('>index.js');
