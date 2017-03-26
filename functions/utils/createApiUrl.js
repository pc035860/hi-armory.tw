const bindApiKey = require('./bindApiKey');

module.exports = function createApiUrl(data) {
  const { region, realm, character, fields } = data;

  let rawUrl = `https://${region.toLowerCase()}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(character)}?locale=zh_TW`;

  if (fields) {
    rawUrl += `&fields=${fields}`;
  }

  return bindApiKey(rawUrl);
};
