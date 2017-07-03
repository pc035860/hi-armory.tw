/* eslint no-param-reassign: 0 */

import memoize from 'memoizee';

import keyBy from 'lodash/fp/keyBy';
import sortedUniqBy from 'lodash/fp/sortedUniqBy';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import flow from 'lodash/flow';

import {
  indexStorageUrl as INDEX_STORAGE_URL,
  armoryIndexStorageUrl as ARMORY_INDEX_STORAGE_URL
} from '../config';

export const NAME = 'armoryCharIndex';

const HISTORY_MAX = 5;
// key: armoryCharIndex.history
const KEY_HISTORY = 'f48de1778787eae6f5f682973491093c';

/**
 * curried functions
 */
const uniqByKey = uniqBy('key');
const keyByItemKey = keyBy(v => v.key);
const processJoinedData = flow(
  // 依角色名稱排序(不考慮 region & realm)
  sortBy([v => v.character.length, 'character']),
  // 唯一(character)
  sortedUniqBy('character')
);

/* @ngInject */
function factory(firebase, $q, $http, $log, $window) {
  const readHistory = () => {
    let res;
    try {
      res = JSON.parse($window.localStorage[KEY_HISTORY] || null);
    }
    catch (e) { /* do nothing */ }
    return res;
  };

  const saveHistory = (history) => {
    try {
      $window.localStorage[KEY_HISTORY] = JSON.stringify(history);
    }
    catch (e) { /* do nothing */ }
  };

  const self = {
    data: [],
    history: readHistory() || [],

    _createItem(key_) {
      const key = key_.toLowerCase();

      const buf = key.split(/-/);
      const region = buf[0];

      const c = buf[buf.length - 1];
      const character = c[0].toUpperCase() + c.slice(1);

      const normalizedKey = `${region}-${character}`;

      return {
        region,
        character,
        key: normalizedKey,
        display: `${character}`
      };
    },

    _parseData(rawData) {
      return rawData.map(v => this._createItem(v));
    },

    __search(str, data, history) {
      if (!data) {
        return [];
      }

      if (str === '') {
        return [...history];
      }

      const historyM = keyByItemKey(history, v => v.key);
      const newData = data.filter(v => !historyM[v.key]);

      const join = [...history, ...newData];
      const re = new RegExp(str, 'i');
      return join.filter(v => re.test(v.character));
    },

    _search(str, data, history) {
      // memoized version of this.__search
    },

    search(str) {
      if (!this.data) {
        return [];
      }
      // wrap to omit history param from outside
      return this._search(str, this.data, this.history);
    },

    _update(storageUrl) {
      const ref = firebase.storage().refFromURL(storageUrl);

      return $q.when(ref.getDownloadURL())
      .then(url => $http.get(url))
      .then((res) => {
        this.data = this.data.concat(this._parseData(res.data));
      })
      .catch(err => $log.error(err));
    },

    update() {
      return $q.all([
        this._update(INDEX_STORAGE_URL),
        this._update(ARMORY_INDEX_STORAGE_URL)
      ])
      .then(() => {
        this.data = processJoinedData(this.data);
      });
    },

    addHistory(keyOrItem) {
      let item;
      if (typeof keyOrItem === 'string') {
        try {
          item = this._createItem(keyOrItem);
        }
        catch (e) {
          $log.warn('add history item fail');
        }
      }
      else {
        item = { ...keyOrItem };
      }

      if (!item) {
        return;
      }

      item.isHistory = true;
      this.history.unshift(item);

      const newHistory = uniqByKey(this.history);

      if (newHistory.length > HISTORY_MAX) {
        newHistory.pop();
      }

      this.history = newHistory;

      saveHistory(this.history);
    }
  };

  self._search = memoize(self.__search);
  self.update();

  return self;
}
factory.$inject = ['firebase', '$q', '$http', '$log', '$window'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
