const delay = require('../utils/delay');

const MAX_RETRY = 3;

const createProfile = (fbRef, initVal) => ({
  STATUS_PENDING: 'pending',
  STATUS_PROCESSING: 'processing',
  STATUS_READY: 'ready',
  STATUS_NOT_FOUND: 'not found',

  val() {
    return fbRef.once('value').then(snapshot => snapshot.val());
  },

  status(status = null) {
    if (status === null) {
      return this.val().then(val => val.status);
    }
    return this.update({ status });
  },

  data(data = null) {
    if (data === null) {
      return this.val().then(val => val.data);
    }
    return this.update({ data });
  },

  update(val) {
    const buf = Object.assign({}, val);
    if (buf.status) {
      buf.statusUpdatedAt = +new Date();
    }
    if (buf.data) {
      buf.dataUpdatedAt = +new Date();
    }
    return fbRef.update(buf);
  },

  remove() {
    return fbRef.remove();
  },

  tryToRetry() {
    if (!initVal) {
      return Promise.reject(new Error('Can\'t retry without init value'));
    }
    const retryCount = initVal.retryCount || 0;

    if (retryCount >= MAX_RETRY) {
      return Promise.resolve();
    }

    return delay(1e3)
    .then(() => {
      const retryData = Object.assign({}, initVal, {
        retryCount: retryCount + 1
      });
      return fbRef.set(retryData);
    });
  }
});

module.exports = createProfile;
