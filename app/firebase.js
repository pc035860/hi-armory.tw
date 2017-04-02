import firebase from 'firebase';

import { firebase as firebaseConfig } from './config';

export const init = () => {
  firebase.initializeApp(firebaseConfig);
};

let _db;
export const getDB = () => {
  if (!_db) {
    _db = firebase.database();
  }
  return _db;
};
