/* eslint global-require: 0 */

const {
  FuseBox, BabelPlugin, PostCSS, CSSPlugin, RawPlugin,
  SassPlugin, HTMLPlugin/* , UglifyJSPlugin */
} = require('fuse-box');

const POST_CSS_PLUGINS = [
  require('postcss-transform-shortcut'),
  require('autoprefixer')('last 2 versions')
];

// Create FuseBox Instance
const fuse = new FuseBox({
  homeDir: 'app/',
  sourcemaps: true,
  outFile: './public/bundle.js',
  plugins: [
    [
      SassPlugin(),
      PostCSS(POST_CSS_PLUGINS),
      CSSPlugin({ minify: false })
    ],

    RawPlugin(['.html']),
    HTMLPlugin({ useDefault: true }),

    BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        sourceMaps: true,
        presets: ['es2015', 'stage-2']
      },
    }),
    // UglifyJSPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   sourceMap: true
    // })
  ],
  shim: {
    jquery: {
      exports: 'jQuery',
    },
    angular: {
      exports: 'angular'
    },
    firebase: {
      exports: 'firebase'
    },
    moment: {
      exports: 'moment'
    }
  }
});

fuse.devServer('>index.js');
