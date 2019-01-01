const functions = require('firebase-functions');

const BLIZZARD_API = functions.config().blizzapi;

module.exports = function getApiKeySet() {
  return {
    clientId: BLIZZARD_API.id1,
    clientSecret: BLIZZARD_API.secret1
  };
};
