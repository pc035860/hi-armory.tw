const functions = require('firebase-functions');

const createDequeueFn = require('./createDequeueFn');

module.exports = function dequeueByResource(admin) {
  const dequeue = createDequeueFn(admin);

  return functions.database.ref('resource').onWrite(event => {
    if (!event.data.previous.exists()) {
      return;
    }

    // 只在有 resource 回歸時動作
    if (event.data.previous.val() >= event.data.val()) {
      return;
    }

    const firstOneRef = admin.database().ref('queue').limitToFirst(1);
    return firstOneRef.once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        return;
      }

      let data;
      let ref;

      snapshot.forEach(s => {
        ref = s.ref;
        data = s.val();
      });

      return dequeue(ref, data);
    });
  });
};
