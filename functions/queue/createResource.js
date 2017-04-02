const createResource = (resourceRef, max = 5) => {
  let _requested = false;

  return {
    request() {
      if (_requested) {
        return Promise.reject(new Error('Can\'t request more than one resource'));
      }
      return resourceRef.transaction((resource) => {
        console.log('[transaction resource]', resource);
        if (resource === null) {
          return max;
        }
        if (resource <= 0) {
          return undefined;
        }
        return resource - 1;
      })
      .then((commited) => {
        if (commited) {
          _requested = true;
        }
        return !!commited;
      });
    },
    release() {
      if (!_requested) {
        return Promise.reject(new Error('Havent\'t request any resource yet'));
      }
      return resourceRef.transaction(r => r + 1)
      .then((commited) => {
        if (commited) {
          _requested = false;
        }
        return !!commited;
      });
    }
  };
};

module.exports = createResource;
