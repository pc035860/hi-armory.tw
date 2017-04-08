/* eslint no-console: 0 */

const admin = require('firebase-admin');

const serviceAccount = require('../firebase-adminsdk.json');

const forEach = require('lodash/forEach');

function usage() {
  console.log('Usage: node createIndex.js <projectid>');
}

function main() {
  const projectId = process.argv[2];

  if (!projectId) {
    usage();
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${projectId}.firebaseio.com`
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
}

main();
