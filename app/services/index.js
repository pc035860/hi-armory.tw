/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./wowProfile'),
    require('./parseProfile'),
    require('./ga'),
    require('./charIndex'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
