const bindApiKey = require('./bindApiKey');

const regionLocaleMap = {
  tw: 'zh_TW',
  us: 'en_US',
  eu: 'en_GB'
};

module.exports = function createApiUrl(data) {
  const { region, realm, character, fields } = data;


  let rawUrl = `https://${region.toLowerCase()}.api.battle.net/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(character)}?locale=${regionLocaleMap[region]}`;

  if (fields) {
    rawUrl += `&fields=${fields}`;
  }

  return bindApiKey(rawUrl);
};
