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
    require('./armoryQuery')
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
