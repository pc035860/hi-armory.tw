import pageTemplate from '../views/page.html';

/* @ngInject */
function config($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/_/',
    controller: 'PageCtrl',
    controllerAs: '$ctrl',
    template: pageTemplate
  })
    .state('index.page', {
      url: ':region/:realm/:character'
    });

  $urlRouterProvider.otherwise('/_/');
}
config.$inject = ['$stateProvider', '$urlRouterProvider'];

export default function configure(ngModule) {
  ngModule.config(config);
}
