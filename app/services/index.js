/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./wowProfile'),
    require('./parseProfile'),
    require('./ga'),
    require('./charIndex'),
    require('./closeKeyboard'),
    require('./realmName'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
