/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./timeDiff'),
    require('./statusText'),
    require('./haReload'),
    require('./legionAssults'),

    require('./app')
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
