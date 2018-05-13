/* eslint global-require: 0 */

const {
  FuseBox,
  BabelPlugin,
  PostCSS,
  CSSPlugin,
  RawPlugin,
  SassPlugin,
  HTMLPlugin,
  WebIndexPlugin
} = require('fuse-box');

const history = require('connect-history-api-fallback');

const POST_CSS_PLUGINS = [
  require('postcss-transform-shortcut'),
  require('autoprefixer')('last 2 versions')
];

// Create FuseBox Instance
const fuse = FuseBox.init({
  homeDir: 'app',
  sourcemaps: true,
  output: 'dist/$name.js',
  target: 'browser@es5',
  cache: true,
  plugins: [
    [SassPlugin(), PostCSS(POST_CSS_PLUGINS), CSSPlugin()],

    RawPlugin(['.html']),
    HTMLPlugin({ useDefault: true }),

    BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        sourceMaps: true,
        presets: ['es2015', 'stage-2']
      }
    }),
    WebIndexPlugin({
      template: 'app/index.html'
    }),
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

fuse.dev(null, (server) => {
  const app = server.httpServer.app;
  app.use(history());
});
fuse
  .bundle('app')
  .instructions('> index.js')
  .hmr()
  .watch();
fuse.run();
