import $ from 'jquery';

export const NAME = 'closeKeyboard';

/* @ngInject */
function factory($document) {
  return function closeKeyboard() {
    $document[0].activeElement.blur();
    $('input').blur();
  };
}
factory.$inject = ['$document'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
