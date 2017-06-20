/* eslint no-console: 0 */

const functions = require('firebase-functions');
const axios = require('axios');
const _ = require('lodash');

const getArmoryKey = require('./utils/getArmoryKey');
const delay = require('./utils/delay');

const WCL_API_KEY = functions.config().wclapi.key;

function normalizeData(data) {
  return Object.assign({}, data, {
    realm: data.realm.toLowerCase(),
    character: data.character.toLowerCase(),
  });
}

function saveCharacterId(db, key, id) {
  return db.ref(`wclId/${key}`).set(id);
}

function apiWclParses(region_, realm_, character_) {
  const region = region_.toUpperCase();
  const realm = encodeURIComponent(realm_);
  const character = encodeURIComponent(character_);

  const apiUrl = `https://www.warcraftlogs.com/v1/parses/character/${character}/${realm}/${region}?api_key=${WCL_API_KEY}`;

  return axios.get(apiUrl);
}

module.exports = function dequeueWcl(admin) {
  return functions.database.ref('queueWcl/{pushId}').onWrite((event) => {
    // 只在第一次建立 dequeue
    if (event.data.previous.exists()) {
      return undefined;
    }

    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return undefined;
    }

    const data = normalizeData(event.data.val());
    const ref = event.data.ref;

    ref.remove();

    console.log('[processing]', `${data.character} - ${data.realm}`);

    const { region, realm, character } = data;
    return apiWclParses(region, realm, character)
    .then((res) => {
      console.log('[wcl response]', res);
      const wclCharacterId = _.get(res, 'data[0].specs[0].data[0].character_id', null);

      if (wclCharacterId === null) {
        return undefined;
      }
      const db = admin.database();
      const armoryKey = getArmoryKey(data, /* noFields */true);
      return saveCharacterId(db, armoryKey, wclCharacterId);
    }, (err) => {
      console.error('[wcl error]', err);
      if (err.response.status.toString()[0] === '4') {
        // status code start with '4' => no retry
        return undefined;
      }
      return delay(1000).then(() => ref.set(data));
    });
  });
};
