/* eslint no-console: 0 */

const functions = require('firebase-functions');
const createProfile = require('./queue/createProfile');
const getArmoryKey = require('./utils/getArmoryKey');
const fetchArmoryData = require('./utils/fetchArmoryData');

const dbNS = 'armoryQuery';


function normalizeData(data) {
  return Object.assign({}, data, {
    region: data.region.toLowerCase(),
    character: data.character.toLowerCase(),
  });
}

function ns(refPath) {
  return `${dbNS}/${refPath}`;
}

function getKey(region, character) {
  return `${region}-${character}`;
}

function addIndex(db, key) {
  return db.ref(ns('index')).child(key).set(true).then(() => true);
}

function removeIndex(db, key) {
  return db.ref(ns('index')).child(key).remove().then(() => true);
}

module.exports = function armoryQuery(admin) {
  return functions.database.ref(ns('queue/{key}')).onWrite((event) => {
    // 只在第一次建立 dequeue
    if (event.data.previous.exists()) {
      return undefined;
    }

    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return undefined;
    }

    const db = admin.database();
    const evtData = normalizeData(event.data.val());
    const ref = event.data.ref;
    const originalProfile = createProfile(ref, evtData);

    // remove from queue
    originalProfile.remove();

    const { region, character } = evtData;
    const key = getKey(region, character);

    // update results status (whether exists or not)
    const refResults = db.ref(ns('results')).child(key);
    const resultsProfile = createProfile(refResults);
    resultsProfile.status(resultsProfile.STATUS_PROCESSING);

    // running
    const refRunning = db.ref(ns('running')).child(key);
    refRunning.set(+new Date());

    return fetchArmoryData(region, character)
    .then((data) => {
      return resultsProfile.update({
        data,
        status: resultsProfile.STATUS_READY
      })
      .then(() => {
        const indexKey = getArmoryKey({
          region,
          realm: data.realm,
          character: data.character
        }, /* noFields */true);
        return addIndex(db, indexKey);
      });
    })
    .catch((err) => {
      console.error(err);
      return resultsProfile.status(resultsProfile.STATUS_READY);
    })
    .then(() => {
      return refRunning.remove().then(() => true);
    });
  });
};
