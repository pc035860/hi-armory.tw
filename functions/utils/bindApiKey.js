const getApiKey = require('./getApiKey');

module.exports = function bindApiKey(url) {
  const apiKey = getApiKey();
  return `${url}&apikey=${apiKey}`;
};
