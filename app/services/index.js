/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./wowProfile'),
    require('./parseProfile'),
    require('./ga'),
    require('./charIndex'),
    require('./closeKeyboard'),
    require('./realmName'),
    require('./wclId'),
    require('./armoryCharIndex'),
    require('./armoryQuery'),
    require('./fixCharacterName'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
