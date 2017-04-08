/* eslint global-require: 0 */

const {
  FuseBox, BabelPlugin, PostCSS, CSSPlugin, RawPlugin,
  SassPlugin, HTMLPlugin, UglifyJSPlugin, EnvPlugin
} = require('fuse-box');

const POST_CSS_PLUGINS = [
  require('postcss-transform-shortcut'),
  require('autoprefixer')('last 2 versions')
];

// Create FuseBox Instance
const fuse = new FuseBox({
  homeDir: 'app/',
  outFile: './dist/bundle.js',
  sourceMaps: false,
  plugins: [
    [
      SassPlugin(),
      PostCSS(POST_CSS_PLUGINS),
      CSSPlugin({ minify: true })
    ],

    RawPlugin(['.html']),
    HTMLPlugin({ useDefault: true }),

    EnvPlugin({ NODE_ENV: process.env.NODE_ENV }),
    BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        presets: ['es2015', 'stage-2']
      },
    }),
    UglifyJSPlugin({
      compress: {
        warnings: false
      }
    })
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

fuse.bundle('>index.js');
