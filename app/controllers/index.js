/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./AppCtrl'),
    require('./PageCtrl'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
