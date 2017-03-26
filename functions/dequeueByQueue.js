const functions = require('firebase-functions');

const createDequeueFn = require('./createDequeueFn');

module.exports = function dequeueByQueue(admin) {
  const dequeue = createDequeueFn(admin);

  return functions.database.ref('queue/{pushId}').onWrite(event => {
    // 只在第一次建立 dequeue
    if (event.data.previous.exists()) {
      return;
    }

    // 被清掉的時候不動作
    if (!event.data.exists()) {
      return;
    }

    const data = event.data.val();
    const ref = event.data.ref;

    return dequeue(ref, data);
  });
};
