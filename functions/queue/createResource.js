const createResource = (resourceRef, total = 5) => {
  let _requested = false;

  return {
    request() {
      if (_requested) {
        return Promise.reject(new Error('Can\'t request more than one resource'));
      }
      return resourceRef.transaction((resource) => {
        if (resource === null) {
          return total;
        }
        if (resource <= 0) {
          return undefined;
        }
        return resource - 1;
      })
      .then(({ committed }) => {
        if (committed) {
          _requested = true;
        }
        return !!committed;
      });
    },
    release() {
      if (!_requested) {
        return Promise.reject(new Error('Havent\'t request any resource yet'));
      }
      return resourceRef.transaction((resource) => {
        if (resource === null) {
          return 1;
        }
        return resource + 1;
      })
      .then(({ committed }) => {
        if (committed) {
          _requested = false;
        }
        return !!committed;
      });
    }
  };
};

module.exports = createResource;
