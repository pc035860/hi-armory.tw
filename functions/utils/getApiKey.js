const R = require('ramda');
const functions = require('firebase-functions');

const config = functions.config();

const maxKeyNumber = 9;

const getKeyFromConfig = (n) => {
  return config.bnetapi[`key${n}`];
};

const retrieveKeys = R.pipe(
  R.map(n => getKeyFromConfig(n)),
  R.filter(v => !!v)
);

const apiKeys = retrieveKeys(R.range(1, 1 + maxKeyNumber));

module.exports = function getApiKey() {
  const l = apiKeys.length;
  return apiKeys[(+new Date()) % l];
};
