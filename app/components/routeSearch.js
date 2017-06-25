import template from './routeSearch.html';
import trim from 'lodash/trim';

export const NAME = 'routeSearch';

const DEFAULT_REGION = 'tw';

class Ctrl {
  static $inject = [
    '$log', '$scope', 'ga', 'armoryCharIndex', 'armoryQuery', '$state', '$stateParams'
  ];

  autocompleteItem;
  loading = false;
  region;
  character;
  results;
  noResults = false;

  /* @ngInject */
  constructor(
    $log, $scope, ga, armoryCharIndex, armoryQuery, $state, $stateParams
  ) {
    $scope.ga = ga;

    this.__deps = { $log, armoryCharIndex, armoryQuery, $state };

    this.region = DEFAULT_REGION;

    if ($stateParams.q) {
      this.character = $stateParams.q;
      this.search(true);
    }
  }

  indexSearch(str) {
    const { armoryCharIndex } = this.__deps;
    return armoryCharIndex.search(str);
  }

  search(noUpdateHistory = false) {
    if (this.loading) {
      return;
    }

    this.character = trim(this.character);

    const { armoryQuery, $state, $log } = this.__deps;

    if (!noUpdateHistory) {
      $state.go('search', { q: this.character }, { notify: false });
    }

    this.loading = true;
    this.results = null;
    this.noResults = false;

    armoryQuery(this.region, this.character)
    .then((data) => {
      this.loading = false;

      if (!data || data.length === 0) {
        this.noResults = true;
        return;
      }
      this.results = data.data;
    });
  }

  queryCharacter(realm, character) {
    const { $state } = this.__deps;
    $state.go('index.page', { realm, character });
  }
}

const component = {
  controller: Ctrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
