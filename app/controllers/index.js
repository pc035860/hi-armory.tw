/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./AppCtrl'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};