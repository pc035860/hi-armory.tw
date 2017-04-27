/* eslint global-require: 0 */

export default (ngModule) => {
  const list = [];
  list.forEach(({ default: configure }) => configure(ngModule));
};
