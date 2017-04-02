/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./wowProfile'),
    require('./parseProfile'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
