export const NAME = 'wowProfile';

/* @ngInject */
function factory(firebase, $firebaseObject, $state) {
  return {
    enqueue(queryData) {
      const ref = firebase.database().ref('queue');
      ref.push({
        ...queryData,
        addedAt: +new Date()
      });
    },
    getFirebaseObject(queryData) {
      const armoryKey = this.getArmoryKey(queryData);
      const ref = firebase.database().ref(`results/${armoryKey}`);
      return $firebaseObject(ref);
    },
    getArmoryKey({ region, realm, character, fields }) {
      return [region, realm, character, fields]
      .map(v => v.toLowerCase()).join('-');
    },
    goToState({ region, realm, character }) {
      $state.go('index.page', { region, realm, character });
    }
  };
}
factory.$inject = ['firebase', '$firebaseObject', '$state'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
