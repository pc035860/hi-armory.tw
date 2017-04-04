import routeConfig from './route';

/* @ngInject */
function config(
  $compileProvider, $logProvider, $animateProvider, $locationProvider
) {
  // if (process.env.NODE_ENV === 'production') {
  //   $compileProvider.debugInfoEnabled(false);
  //   $logProvider.debugEnabled(false);
  // }

  $compileProvider.debugInfoEnabled(false);
  $logProvider.debugEnabled(false);

  $locationProvider.html5Mode(true);

  /**
   * Boost animation performance
   */
  // also support bootstrap modal fading
  $animateProvider.classNameFilter(/\b(ng-anim|fade)\b/);
}
config.$inject = ['$compileProvider', '$logProvider', '$animateProvider', '$locationProvider'];

export default (ngModule) => {
  ngModule.config(config);

  routeConfig(ngModule);
};
