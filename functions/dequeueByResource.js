const functions = require('firebase-functions');

const createDequeueFn = require('./createDequeueFn');

module.exports = function dequeueByResource(admin) {
  const dequeue = createDequeueFn(admin);

  return functions.database.ref('resource').onWrite((change, context) => {
    if (!change.before.exists()) {
      return undefined;
    }

    // 只在有 resource 回歸時動作
    if (change.before.val() >= change.after.val()) {
      return undefined;
    }

    const firstOneRef = admin.database().ref('queue').limitToFirst(1);
    return firstOneRef.once('value')
    .then((snapshot) => {
      if (!snapshot.exists()) {
        return undefined;
      }

      let data;
      let ref;

      snapshot.forEach((s) => {
        ref = s.ref;
        data = s.val();
      });

      return dequeue(ref, data);
    });
  });
};
