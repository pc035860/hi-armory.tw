const functions = require('firebase-functions');

const createDequeueFn = require('./createDequeueFn');

module.exports = function dequeueByQueue(admin) {
  const dequeue = createDequeueFn(admin);

  return functions.database.ref('queue/{pushId}').onWrite((change, context) => {
    // 只在第一次建立 dequeue
    if (change.before.exists()) {
      return undefined;
    }

    // 被清掉的時候不動作
    if (!change.after.exists()) {
      return undefined;
    }

    const data = change.after.val();
    const ref = change.after.ref;

    return dequeue(ref, data);
  });
};
