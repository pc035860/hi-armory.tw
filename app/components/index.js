/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./timeAgo'),
    require('./statusText'),
    require('./haReload'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
