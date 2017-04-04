import angular from 'angular';

import { realms as REALMS } from '../config';

const AUTO_REQUERY_DIFF = 86400 * 1000;  // auto re-query

export const NAME = 'AppCtrl';

class AppCtrl {
  static $inject = ['$log', '$scope', '$state', 'wowProfile', 'parseProfile'];

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
              // no data, trigger first-time query
              this.query(this.region, this.realm, this.character, { enqueue: true });
            }
            else if ((+new Date()) - obj.dataUpdatedAt > AUTO_REQUERY_DIFF) {
              // auto re-query
              this.query(this.region, this.realm, this.character, { enqueue: true });
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

  /**
   * Query
   * @param  {string} region    region
   * @param  {string} realm     realm
   * @param  {string} character character
   * @param  {object} options   { bool: enqueue  }
   */
  query(region, realm, character, options_) {
    const options = {
      ...{ enqueue: false },
      ...(options_ || {})
    };

    if (!region || !realm || !character) {
      return;
    }

    if (
      this.profile && this.profile.$resolved &&
      this.profile.status !== 'ready' && this.profile.status !== 'not found' &&
      this.profile.$value !== null) {
      return;
    }

    const { wowProfile } = this.__deps;

    const srefParams = {
      region: 'tw',
      realm,
      character
    };

    if (options.enqueue) {
      wowProfile.enqueue({
        ...srefParams,
        fields: this.fields
      });
    }

    wowProfile.goToState(srefParams);
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, AppCtrl);
}
