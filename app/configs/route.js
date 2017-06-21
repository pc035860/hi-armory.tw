/* @ngInject */
function config($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('search', {
    url: '/search',
    template: '<route-search></route-search>'
  })
  .state('index', {
    url: '/',
    template: '<route-app></route-app>'
  })
    .state('index.page', {
      url: ':realm/:character'
    });

  $urlRouterProvider.otherwise('/');
}
config.$inject = ['$stateProvider', '$urlRouterProvider'];

export default function configure(ngModule) {
  ngModule.config(config);
}
