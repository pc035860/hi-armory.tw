/* eslint no-console: 0 */

const functions = require('firebase-functions');
const axios = require('axios');

const createApiUrl = require('./utils/createApiUrl');
const getArmoryKey = require('./utils/getArmoryKey');
const createProfile = require('./queue/createProfile');
const createResource = require('./queue/createResource');

const RESOURCE_TOTAL = Number(functions.config().resource.total);

function normalizeData(data) {
  return Object.assign({}, data, {
    realm: data.realm.toLowerCase(),
    character: data.character.toLowerCase()
  });
}

function addIndex(db, key) {
  return db
    .ref(`index/${key}`)
    .set(true)
    .then(() => true);
}

function removeIndex(db, key) {
  return db
    .ref(`index/${key}`)
    .remove()
    .then(() => true);
}

module.exports = function createDequeue(admin) {
  return (ref, data_) => {
    const db = admin.database();
    const data = normalizeData(data_);
    const resource = createResource(db.ref('resource'), RESOURCE_TOTAL);
    const originProfile = createProfile(ref, data_);

    const armoryKey = getArmoryKey(data);

    let newProfile;
    try {
      newProfile = createProfile(db.ref(`results/${armoryKey}`));
    }
    catch (e) {
      // 無法建立 profile -> 直接從 queue 裡砍掉
      return originProfile.remove();
    }

    newProfile.status(newProfile.STATUS_PENDING);

    return resource
      .request()
      .then((ok) => {
        console.log('[resource requested]', armoryKey, ok);
        if (!ok) {
          return undefined;
        }

        originProfile.remove();
        newProfile.status(newProfile.STATUS_PROCESSING);

        const apiUrl = createApiUrl(data);
        return axios.get(apiUrl).then(
          (res) => {
            return resource.release().then(() => {
              console.log('[resource released] api query success');
              return newProfile
                .update({
                  data: res.data,
                  status: newProfile.STATUS_READY
                })
                .then(() => {
                  const key = getArmoryKey(data, /* noFields */ true);
                  return addIndex(db, key);
                });
            });
          },
          (err) => {
            return resource.release().then(() => {
              console.log('[resource released] api query fail');
              if (err.response.status === 404) {
                return newProfile
                  .update({
                    data: null,
                    status: newProfile.STATUS_NOT_FOUND
                  })
                  .then(() => {
                    const key = getArmoryKey(data, /* noFields */ true);
                    return removeIndex(db, key);
                  });
              }
              return originProfile.retry().catch(() => {
                // retry failed, fallback to ready
                return newProfile.status(newProfile.STATUS_READY);
              });
            });
          }
        );
      })
      .catch(err => console.error(err));
  };
};
