import { realms as REALMS } from '../config';

export const NAME = 'realmName';

/* @ngInject */
function factory() {
  return (region) => {
    const e2l = {};
    const l2e = {};

    // create mapping
    REALMS[region].forEach(([localed, en]) => {
      e2l[en] = localed;
      l2e[localed] = en;
    });

    const toEn = localedName => l2e[localedName];
    const toLocaled = enName => e2l[enName.toLowerCase()];
    const isEn = name => /[a-z-]/i.test(name);
    const isLocaled = name => !isEn(name);

    return { toEn, toLocaled, isEn, isLocaled };
  };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
