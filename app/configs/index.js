import routeConfig from './route';

/* @ngInject */
function config(
  $compileProvider, $logProvider, $animateProvider
) {
  // if (process.env.NODE_ENV === 'production') {
  //   $compileProvider.debugInfoEnabled(false);
  //   $logProvider.debugEnabled(false);
  // }

  /**
   * Boost animation performance
   */
  // also support bootstrap modal fading
  $animateProvider.classNameFilter(/\b(ng-anim|fade)\b/);
}
config.$inject = ['$compileProvider', '$logProvider', '$animateProvider'];

export default (ngModule) => {
  ngModule.config(config);

  routeConfig(ngModule);
};
