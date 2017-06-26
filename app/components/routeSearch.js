import $ from 'jquery';

import trim from 'lodash/trim';
import debounce from 'lodash/debounce';
import template from './routeSearch.html';

export const NAME = 'routeSearch';

const DEFAULT_REGION = 'tw';

class Ctrl {
  static $inject = [
    '$log', '$scope', 'ga', 'armoryCharIndex', 'armoryQuery', '$state', '$stateParams', '$timeout'
  ];

  autocompleteItem;
  loading = false;
  region;
  character;
  results;
  searched = false;
  noResults = false;

  /* @ngInject */
  constructor(
    $log, $scope, ga, armoryCharIndex, armoryQuery, $state, $stateParams, $timeout
  ) {
    $scope.ga = ga;

    this.__deps = { $log, armoryCharIndex, armoryQuery, $state, $scope, $stateParams, $timeout };

    this.region = DEFAULT_REGION;
    this.search = debounce(this._search, 200);
  }

  $onInit() {
    const { $scope, $stateParams, $timeout } = this.__deps;

    if ($stateParams.q) {
      this.character = $stateParams.q;
      this.search(true);
    }
    else {
      $timeout(() => {
        $('input').focus();
      });
    }

    $scope.$watch(() => this.character, (val, oldVal) => {
      if (val !== oldVal) {
        this.search();
      }
    });
  }

  indexSearch(str) {
    const { armoryCharIndex } = this.__deps;
    return armoryCharIndex.search(str);
  }

  _search(noUpdateHistory = false) {
    this.character = trim(this.character);

    if (!this.character || this.character.length < 2) {
      return;
    }

    const { armoryQuery, $state, $log } = this.__deps;

    if (!noUpdateHistory) {
      $state.go('search', { q: this.character }, { notify: false });
    }

    this.loading = true;
    this.searched = true;
    this.results = null;
    this.noResults = false;

    const region = this.region;
    const character = this.character.toLowerCase();

    armoryQuery(region, character)
    .then((data) => {
      const q = data._query;

      if (this.region !== q.region ||
          this.character.toLowerCase() !== q.character
      ) {
        return;
      }

      this.loading = false;

      if (!data || !data.data || data.data.length === 0) {
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

  officalSearchLink() {
    const localeMap = {
      tw: 'zh-tw',
      eu: 'en-gb',
      us: 'en-us',
      kr: 'ko-kr'
    };

    const locale = localeMap[this.region];
    const q = encodeURIComponent(this.character);
    return `https://worldofwarcraft.com/${locale}/search?q=${q}`;
  }
}

const component = {
  controller: Ctrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
