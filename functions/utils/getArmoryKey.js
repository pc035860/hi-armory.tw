module.exports = function getArmoryKey(data, noFields = false) {
  const glue = '-';
  const { region, realm, character, fields } = data;

  if (noFields) {
    return [region, realm, character].join(glue);
  }

  return [region, realm, character, fields].join(glue);
};
