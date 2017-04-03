import moment from 'moment';

export const NAME = 'fromNow';

/* @ngInject */
function filter() {
  return function (input) {
    return moment(input).fromNow();
  };
}

export default function configure(ngModule) {
  ngModule.filter(NAME, filter);
}
