export const NAME = 'ga';

/* @ngInject */
function factory($window) {
  return {
    pageview(...args) {
      $window.ga(...['send', 'pageview', ...args]);
    },
    event(...args) {
      $window.ga(...['send', 'event', ...args]);
    }
  };
}
factory.$inject = ['$window'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
