/* eslint no-console: 0 */

const admin = require('firebase-admin');

const serviceAccount = require('../firebase-adminsdk.json');

const forEach = require('lodash/forEach');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://wow-ap-level.firebaseio.com'
});

const db = admin.database();

db.ref('results').once('value', (snapshot) => {
  const updates = {};
  let count = 0;

  forEach(snapshot.val(), (v, k) => {
    const simpleKey = k.split(/-/).slice(0, -1).join('-');

    count += 1;
    console.log(count, 'simpleKey', simpleKey);

    if (v.status === 'not found') {
      updates[simpleKey] = null;
    }
    else if (v.data) {
      updates[simpleKey] = true;
    }
  });

  db.ref('index').update(updates)
  .then(() => {
    console.log('done!');

    db.goOffline();
  });
});
