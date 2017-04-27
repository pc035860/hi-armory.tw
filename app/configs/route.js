/* @ngInject */
function config($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    template: '<app></app>'
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
