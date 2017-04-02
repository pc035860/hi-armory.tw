export const NAME = 'PageCtrl';

class PageCtrl {
  __deps;
  profile;
  region;
  realm;
  character;
  parsedProfile;

  /* @ngInject */
  constructor(
    $log, $scope, $state, wowProfile, parseProfile
  ) {
    this.__deps = { $log, wowProfile };

    this.region = 'tw';

    $scope.$watch(() => $state.params, (val) => {
      const { region, realm, character } = val;

      $log.debug('val', realm, character);

      if (this.profile) {
        this.profile.$destroy();
      }

      if (region && realm && character) {
        Object.assign(this, {
          region,
          realm,
          character
        });

        this.profile = wowProfile.getFirebaseObject({
          region,
          realm,
          character,
          fields: 'items,progression'
        });
      }
      else {
        this.profile = null;
      }
    });

    $scope.$watch(() => this.profile, (val) => {
      if (val && val.data) {
        this.parsedProfile = parseProfile(val.data);
      }
    }, true);
  }

  query(region, realm, character) {
    if (!region || !realm || !character) {
      return;
    }

    const { wowProfile } = this.__deps;

    const srefParams = {
      region: 'tw',
      realm,
      character
    };

    wowProfile.queue({
      ...srefParams,
      fields: 'items,progression'
    });

    wowProfile.goToState(srefParams);
  }
}
PageCtrl.$inject = ['$log', '$scope', '$state', 'wowProfile', 'parseProfile'];

export default function configure(ngModule) {
  ngModule.controller(NAME, PageCtrl);
}
