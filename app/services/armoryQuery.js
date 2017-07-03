export const NAME = 'armoryQuery';

const expireDuration = 2 * 86400 * 1000;

/* @ngInject */
function factory(firebase, $q, $timeout, $cacheFactory) {
  const ns = (refPath) => {
    return `armoryQuery/${refPath}`;
  };
  const cache = $cacheFactory('armoryQuery');

  return function (region, character) {
    const key = `${region}-${character}`;

    const bundleQueryParams = (v) => {
      return {
        ...v,
        _query: { region, character }
      };
    };

    const cached = cache.get(key);
    if (cached) {
      return $q.resolve(bundleQueryParams(cached));
    }

    const now = +new Date();
    const db = firebase.database();

    const dfd = $q.defer();

    const resultsRef = db.ref(ns('results')).child(key);

    const onResultsValue = (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const val = snapshot.val();

      if (val.status === 'ready' || val.status === 'error') {
        if (val.status === 'ready') {
          cache.put(key, val);
        }
        $timeout(() => dfd.resolve(val));
        resultsRef.off('value', onResultsValue);
      }
    };
    const queue = () => {
      resultsRef.on('value', onResultsValue);
      db.ref(ns('queue')).child(key).set({
        region, character
      });
    };

    // 嘗試拿 cache results
    resultsRef.once('value').then((snapshot) => {
      if (!snapshot.exists()) {
        // results 不存在 -> queue
        queue();
        return;
      }

      const val = snapshot.val();

      if (val.status === 'ready' &&
          (
            (  // 查過有資料
              val.data &&
              val.dataUpdatedAt + expireDuration > now
            ) ||
            (  // 查過沒資料 (只有 status)
              !val.data &&
              val.statusUpdatedAt + expireDuration > now
            )
          )
      ) {
        cache.put(key, val);
        $timeout(() => dfd.resolve(val));
        return;
      }

      // results 過期 -> queue
      // 前提是現在沒有在 processing
      if (val.status !== 'processing') {
        queue();
      }
    });

    return dfd.promise.then(data => bundleQueryParams(data));
  };
}
factory.$inject = ['firebase', '$q', '$timeout', '$cacheFactory'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
