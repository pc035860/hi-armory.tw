import memoize from 'memoizee';
import keyBy from 'lodash/keyBy';
import uniqBy from 'lodash/uniqBy';
import { indexStorageUrl } from '../config';

export const NAME = 'charIndex';

const HISTORY_MAX = 5;

/* @ngInject */
function factory(firebase, $q, $http, $log) {
  const self = {
    data: null,
    history: [],

    _createItem(key_) {
      const key = key_.toLowerCase();
      const buf = key.split(/-/);
      const region = buf[0];
      const realm = buf.slice(1, -1).join('-');

      const c = buf[buf.length - 1];
      const character = c[0].toUpperCase() + c.slice(1);

      return {
        region,
        realm,
        character,
        key,
        display: `${character} - ${realm}`
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
        return history;
      }

      const historyM = keyBy(history, v => v.key);
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

    update() {
      const ref = firebase.storage().refFromURL(indexStorageUrl);

      return $q.when(ref.getDownloadURL())
      .then(url => $http.get(url))
      .then((res) => {
        this.data = this._parseData(res.data);
      })
      .catch(err => $log.error(err));
    },

    addHistory(keyOrItem) {
      let item;
      if (typeof keyOrItem === 'string') {
        item = this._createItem(keyOrItem);
      }
      else {
        item = { ...keyOrItem };
      }

      item.isHistory = true;
      this.history.unshift(item);

      const newHistory = uniqBy(this.history, 'key');

      if (newHistory.length > HISTORY_MAX) {
        newHistory.pop();
      }

      this.history = newHistory;
    }
  };

  self._search = memoize(self.__search);
  self.update();

  return self;
}
factory.$inject = ['firebase', '$q', '$http', '$log'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
