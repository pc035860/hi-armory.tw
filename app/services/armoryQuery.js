export const NAME = 'armoryQuery';

const expireDuration = 86400 * 1000;

/* @ngInject */
function factory(firebase, $q) {
  const ns = (refPath) => {
    return `armoryQuery/${refPath}`;
  };

  return function (region, character) {
    const now = +new Date();
    const db = firebase.database();
    const key = `${region}-${character}`;

    const dfd = $q.defer();

    const resultsRef = db.ref(ns('results')).child(key);

    const onResultsValue = (snapshot) => {
      const val = snapshot.val();

      if (val.status === 'ready') {
        dfd.resolve(val);
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
          val.dataUpdatedAt + expireDuration > now
      ) {
        dfd.resolve(val);
        return;
      }

      // results 過期 -> queue
      // 前提是現在沒有在 processing
      if (val.status !== 'processing') {
        queue();
      }
    });

    return dfd;
  };
}
factory.$inject = ['firebase', '$q'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
