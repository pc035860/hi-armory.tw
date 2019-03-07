/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./timeDiff'),
    require('./statusText'),
    require('./haReload'),
    require('./legionAssults'),
    require('./bfaAssults'),
    require('./app'),

    require('./routeApp'),
    require('./routeSearch'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
