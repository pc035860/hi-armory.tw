const { FuseBox, BabelPlugin } = require("fuse-box");


// Create FuseBox Instance
const fuse = new FuseBox({
  homeDir: "src/",
  sourcemaps: true,
  outFile: "./public/bundle.js",
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
      exports: '$'
    }
  }
});

fuse.devServer(">index.js");
