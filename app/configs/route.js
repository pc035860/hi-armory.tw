/* @ngInject */
function config($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/'
  })
    .state('index.page', {
      url: ':region/:realm/:character'
    });

  $urlRouterProvider.otherwise('/');
}
config.$inject = ['$stateProvider', '$urlRouterProvider'];

export default function configure(ngModule) {
  ngModule.config(config);
}
