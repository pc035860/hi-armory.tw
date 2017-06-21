import template from './routeSearch.html';

export const NAME = 'routeSearch';

const DEFAULT_REGION = 'tw';

class Ctrl {
  static $inject = [
    '$log', '$scope', 'ga', 'armoryCharIndex'
  ];

  autocompleteItem;
  loading = false;
  region;
  character;

  /* @ngInject */
  constructor(
    $log, $scope, ga, armoryCharIndex
  ) {
    $scope.ga = ga;

    this.__deps = { armoryCharIndex };

    this.region = DEFAULT_REGION;
  }

  indexSearch(str) {
    const { armoryCharIndex } = this.__deps;
    return armoryCharIndex.search(str);
  }
}

const component = {
  controller: Ctrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
