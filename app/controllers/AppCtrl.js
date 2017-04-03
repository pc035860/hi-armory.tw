import angular from 'angular';

import { realms as REALMS } from '../config';

export const NAME = 'AppCtrl';

class AppCtrl {
  __deps;
  REALMS;
  profile;
  region;
  realm;
  character;
  pp;  // parsedProfile
  pd;  // profile.data

  /* @ngInject */
  constructor(
    $log, $scope, $state, wowProfile, parseProfile
  ) {
    this.__deps = { $log, wowProfile };

    this.region = 'tw';
    this.fields = 'items,progression,talents';
    this.REALMS = REALMS;

    $scope.$watch(() => $state.params, (val, oldVal) => {
      const { region, realm, character } = val;

      $log.debug('val', realm, character);

      const requireNewProfile = !angular.equals(val, oldVal);

      if (this.profile && requireNewProfile) {
        this.profile.$destroy();
      }

      if (region && realm && character) {
        Object.assign(this, {
          region,
          realm,
          character
        });

        if (requireNewProfile) {
          this.profile = wowProfile.getFirebaseObject({
            region,
            realm,
            character,
            fields: this.fields
          });

          this.profile.$loaded()
          .then((obj) => {
            if (!obj.data && obj.status !== 'not found') {
              this.query(true, this.region, this.realm, this.character);
            }
          });
        }
      }
      else {
        this.profile = null;
      }
    });

    $scope.$watch(() => this.profile, (val) => {
      if (val && val.data) {
        this.pp = parseProfile(val.data);  // parsedProfile
        this.pd = val.data;
      }
      else {
        this.pp = null;
        this.pd = null;
      }
    }, true);
  }

  query(enqueue, region, realm, character) {
    if (!region || !realm || !character) {
      return;
    }

    const { wowProfile } = this.__deps;

    const srefParams = {
      region: 'tw',
      realm,
      character
    };

    if (enqueue) {
      wowProfile.enqueue({
        ...srefParams,
        fields: this.fields
      });
    }

    wowProfile.goToState(srefParams);
  }
}
AppCtrl.$inject = ['$log', '$scope', '$state', 'wowProfile', 'parseProfile'];

export default function configure(ngModule) {
  ngModule.controller(NAME, AppCtrl);
}
