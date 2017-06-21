export const NAME = 'armoryCharIndex';

/* @ngInject */
function factory() {
  const self = {
    search(str) {
      return [];
    }
  };

  return self;
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
