module.exports = function getArmoryKey(data) {
  const { region, realm, character, fields } = data;
  return [region, realm, character, fields].join('-');
};
