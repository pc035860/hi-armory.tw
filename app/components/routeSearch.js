import template from './routeSearch.html';

export const NAME = 'routeSearch';

const DEFAULT_REGION = 'tw';

class Ctrl {
  static $inject = [
    '$log', '$scope', 'ga', 'armoryCharIndex', 'armoryQuery'
  ];

  autocompleteItem;
  loading = false;
  region;
  character;

  /* @ngInject */
  constructor(
    $log, $scope, ga, armoryCharIndex, armoryQuery
  ) {
    $scope.ga = ga;

    this.__deps = { $log, armoryCharIndex, armoryQuery };

    this.region = DEFAULT_REGION;
  }

  indexSearch(str) {
    const { armoryCharIndex } = this.__deps;
    return armoryCharIndex.search(str);
  }

  search() {
    if (this.loading) {
      return;
    }

    const { armoryQuery, $log } = this.__deps;

    this.loading = true;

    armoryQuery(this.region, this.character)
    .then((data) => {
      this.loading = false;

      $log.log('@query results', data);
    });
  }
}

const component = {
  controller: Ctrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
