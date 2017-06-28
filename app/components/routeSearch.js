import $ from 'jquery';

import trim from 'lodash/trim';
import debounce from 'lodash/debounce';
import findKey from 'lodash/findKey';
import template from './routeSearch.html';

import { classNames as CLASS_NAMES } from '../config';


export const NAME = 'routeSearch';

const DEFAULT_REGION = 'tw';

const getClassNo = (klassName) => {
  return findKey(CLASS_NAMES, (v) => {
    return v[0] === klassName || v[1] === klassName;
  });
};

class Ctrl {
  static $inject = [
    '$log', '$scope', 'ga', 'armoryCharIndex', 'armoryQuery', '$state', '$stateParams',
    '$timeout', 'closeKeyboard', '$document', '$mdMedia'
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
    $log, $scope, ga, armoryCharIndex, armoryQuery, $state, $stateParams,
    $timeout, closeKeyboard, $document, $mdMedia
  ) {
    $scope.ga = ga;

    this.__deps = {
      $log,
      armoryCharIndex,
      armoryQuery,
      $state,
      $scope,
      $stateParams,
      $timeout,
      closeKeyboard,
      $document,
      $mdMedia
    };

    this.region = DEFAULT_REGION;
    this.search = debounce(this._search, 400);
    this.onKeydown = this.onKeydown.bind(this);
  }

  $onInit() {
    const { $scope, $stateParams, $timeout, $document, $mdMedia } = this.__deps;

    if ($stateParams.q) {
      this.character = $stateParams.q;
      this._search(true);
    }
    else if (!$mdMedia('xs')) {
        $timeout(() => {
          $('input').focus();
        });
      }

    $scope.$watch(() => this.character, (val, oldVal) => {
      if (val !== oldVal) {
        this.search();
      }
    });

    $document.on('keydown', this.onKeydown);
  }

  $onDestroy() {
    const { $document } = this.__deps;
    $document.off('keydown', this.onKeydown);
  }

  onKeydown($evt) {  // eslint-disable-line
    // "/" to focus
    if ($evt.which === 191 ||
        $evt.which === 111
    ) {
      $evt.preventDefault();
      $('input').focus().select();
    }
  }

  indexSearch(str) {
    const { armoryCharIndex } = this.__deps;
    return armoryCharIndex.search(str);
  }

  closeKeyboard() {
    const { closeKeyboard } = this.__deps;
    closeKeyboard();
  }

  _search(noUpdateHistory = false) {
    const { $scope } = this.__deps;

    this.character = trim(this.character);

    if (!this.character || this.character.length < 2) {
      this.results = null;
      this.searched = false;
      this.noResults = false;
      $scope.$digest();
      return;
    }

    const { armoryQuery, $state, $log, armoryCharIndex } = this.__deps;

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

      armoryCharIndex.addHistory(`${this.region}-${this.character}`);
      this.results = data.data.map((v) => {
        return {
          ...v,
          // add classNo
          classNo: getClassNo(v.class)
        };
      });
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
