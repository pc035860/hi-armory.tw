export const NAME = 'wclId';

/* @ngInject */
function factory(firebase, $firebaseObject) {
  return {
    enqueue(queryData) {
      const ref = firebase.database().ref('queueWcl');
      ref.push({
        ...queryData,
        addedAt: +new Date()
      });
    },
    getFirebaseObject(queryData) {
      const armoryKey = this._getKey(queryData);
      const ref = firebase.database().ref(`wclId/${armoryKey}`);
      return $firebaseObject(ref);
    },
    _getKey({ region, realm, character }) {
      return [region, realm, character]
      .map(v => v.toLowerCase()).join('-');
    }
  };
}
factory.$inject = ['firebase', '$firebaseObject'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
