const functions = require('firebase-functions');

const axios = require('axios');

const createApiUrl = require('./utils/createApiUrl');
const getArmoryKey = require('./utils/getArmoryKey');
const delay = require('./utils/delay');

const MAX_RETRY = 3;

function normalizeData(data) {
  return Object.assign({}, data, {
    realm: data.realm.toLowerCase(),
    character: data.character.toLowerCase()
  });
}

module.exports = function createDequeue(admin) {
  return function(ref, data_) {
    const db = admin.database();
    const resourceRef = db.ref('resource');

    const data = normalizeData(data_);

    const releaseResource = () => {
      // release resource
      return resourceRef.transaction(r => r + 1);
    };

    return resourceRef.transaction(resource => {
      console.log('[transaction resource]', resource);
      if (resource === null) {
        return 5;
      }
      if (resource <= 0) {
        return;
      }
      return resource - 1;
    }).then((commited, resourceSnap) => {
      console.log('[transaction]', commited);
      if (commited) {
        const apiUrl = createApiUrl(data);

        // remove it
        ref.remove();

        const armoryKey = getArmoryKey(data);
        const nextRef = db.ref(`results/${armoryKey}`);

        nextRef.update({
          status: 'processing'
        });

        return axios.get(apiUrl)
        .then(res => {
          console.log('[response]', res);
          return releaseResource()
          .then(() => {
            // add to results
            return nextRef.update({
              data: res.data,
              status: 'done',
              updatedAt: +new Date
            });
          });
        }, err => {
          console.log('[error]', err);
          return releaseResource()
          .then(() => {
            if (err.response.status === 404) {
              // add not found results
              return nextRef.update({
                data: null,
                status: 'not found',
                updatedAt: +new Date
              });
            }

            // add back to queue in 1 sec
            const retry = data.retry || 0;

            if (retry >= MAX_RETRY) {
              return;
            }
            return delay(1000).then(() => {
              const retryData = Object.assign({}, data_, {
                retry: retry + 1
              });
              return ref.set(retryData);
            });
          });
        });
      }
    });
  };
};
