const axios = require('axios');

const createApiUrl = require('./utils/createApiUrl');
const getArmoryKey = require('./utils/getArmoryKey');
const createProfile = require('./queue/createProfile');
const createResource = require('./queue/createResource');

function normalizeData(data) {
  return Object.assign({}, data, {
    realm: data.realm.toLowerCase(),
    character: data.character.toLowerCase(),
  });
}

module.exports = function createDequeue(admin) {
  return (ref, data_) => {
    const db = admin.database();
    const data = normalizeData(data_);
    const resource = createResource(db.ref('resource'));
    const originProfile = createProfile(ref, data_);

    return resource.request()
    .then((ok) => {
      console.log('[resource request]', ok);
      if (!ok) {
        return undefined;
      }

      originProfile.remove();

      const apiUrl = createApiUrl(data);
      const armoryKey = getArmoryKey(data);
      const newProfile = createProfile(db.ref(`results/${armoryKey}`));

      newProfile.status(newProfile.STATUS_PROCESSING);

      return axios.get(apiUrl)
      .then((res) => {
        return resource.release()
        .then(() => {
          return newProfile.update({
            data: res.data,
            status: newProfile.STATUS_READY
          });
        });
      }, (err) => {
        return resource.release()
        .then(() => {
          if (err.response.status === 404) {
            return newProfile.update({
              data: null,
              status: newProfile.STATUS_NOT_FOUND
            });
          }
          return originProfile.tryToRetry();
        });
      });
    })
    .catch(err => console.error(err));
  };
};
