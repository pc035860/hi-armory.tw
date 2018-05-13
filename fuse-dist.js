/* eslint global-require: 0 */

const {
  FuseBox,
  BabelPlugin,
  PostCSS,
  CSSPlugin,
  RawPlugin,
  SassPlugin,
  HTMLPlugin,
  EnvPlugin,
  QuantumPlugin,
  WebIndexPlugin,
} = require('fuse-box');

const POST_CSS_PLUGINS = [
  require('postcss-transform-shortcut'),
  require('autoprefixer')('last 2 versions')
];

// Create FuseBox Instance
const fuse = FuseBox.init({
  homeDir: 'app',
  output: 'dist/$name.js',
  hash: true,
  target: 'browser@es5',
  sourceMaps: false,
  plugins: [
    [SassPlugin(), PostCSS(POST_CSS_PLUGINS), CSSPlugin()],

    RawPlugin(['.html']),
    HTMLPlugin({ useDefault: true }),

    EnvPlugin({ NODE_ENV: process.env.NODE_ENV }),
    BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        presets: ['es2015', 'stage-2']
      }
    }),
    WebIndexPlugin({
      template: 'app/index.html'
    }),
    QuantumPlugin({
      css: true,
      treeshake: true,
      uglify: true,
      bakeApiIntoBundle: 'app'
    })
  ],
  shim: {
    jquery: {
      exports: 'jQuery'
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

fuse.bundle('app').instructions('> index.js');
fuse.run();
