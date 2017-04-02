import { getDB as getFirebaseDB } from '../firebase';

export const NAME = 'wowProfile';

/* @ngInject */
function factory(firebase, $firebaseObject, $state) {
  return {
    queue(queryData) {
      const ref = getFirebaseDB().ref('queue');
      ref.push({
        ...queryData,
        addedAt: +new Date()
      });
    },
    getFirebaseObject(queryData) {
      const armoryKey = this.getArmoryKey(queryData);
      const ref = getFirebaseDB().ref(`results/${armoryKey}`);
      return $firebaseObject(ref);
    },
    getArmoryKey({ region, realm, character, fields }) {
      return [region, realm, character, fields].join('-');
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
