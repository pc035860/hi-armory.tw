/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [
    require('./fromNow'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
