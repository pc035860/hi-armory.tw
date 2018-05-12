export const NAME = 'fixCharacterName';

/* @ngInject */
function factory() {
  return function fixCharacterName(name) {
    if (!name) {
      return name;
    }
    return name.replace(/[.#$[\]]/g, '');
  };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
