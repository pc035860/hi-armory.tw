const regionLocaleMap = {
  tw: 'zh_TW',
  us: 'en_US',
  eu: 'en_GB'
};

module.exports = function createApiUrl(data, token) {
  const { region, realm, character, fields } = data;

  let rawUrl = `https://${region.toLowerCase()}.api.blizzard.com/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(character)}?locale=${regionLocaleMap[region]}`;

  if (fields) {
    rawUrl += `&fields=${fields}`;
  }

  return `${rawUrl}&access_token=${token}`;
};
