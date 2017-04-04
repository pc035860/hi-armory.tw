import angular from 'angular';

import { realms as REALMS } from '../config';

const AUTO_REQUERY_DIFF = 86400 * 1000;  // auto re-query

const DEFAULT_REGION = 'tw';

export const NAME = 'AppCtrl';

class AppCtrl {
  static $inject = [
    '$log', '$scope', '$state', 'wowProfile', 'parseProfile', 'ga', '$location'
  ];

  __deps;
  REALMS;
  profile;
  region;
  realm;
  character;
  reloading;
  pp;  // parsedProfile
  pd;  // profile.data

  /* @ngInject */
  constructor(
    $log, $scope, $state, wowProfile, parseProfile, ga, $location
  ) {
    this.__deps = { $log, wowProfile, ga };

    $scope.ga = ga;

    this.region = DEFAULT_REGION;
    this.fields = 'items,progression,talents';
    this.REALMS = REALMS;

    $scope.$watch(() => $state.params, (val, oldVal) => {
      const region = this.region;
      const { realm, character } = val;

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
              this.query({ enqueue: true });
            }
            else if ((+new Date()) - obj.dataUpdatedAt > AUTO_REQUERY_DIFF) {
              // auto re-query
              this.query({ enqueue: true });
            }
          });
        }
      }
      else {
        this.profile = null;
      }
    });

    $scope.$watch(() => this.profile, (val, oldVal) => {
      if (val && val.data && typeof val.data !== 'string') {
        this.pp = parseProfile(val.data);  // parsedProfile
        this.pd = val.data;
      }
      else {
        this.pp = null;
        this.pd = null;
      }

      if (val && val.status && oldVal && oldVal.status) {
        if (val.status === 'ready' && oldVal.status !== 'ready') {
          this.reloading = false;
        }
      }
    }, true);

    $scope.$on('$stateChangeSuccess', () => {
      ga.pageview($location.path());
    });
  }

  /**
   * Query
   * @param  {object} options   { bool: enqueue  }
   */
  query(options_) {
    const options = {
      ...{ enqueue: false },
      ...(options_ || {})
    };

    const { region, realm, character } = this;

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

  reload() {
    this.query({ enqueue: true });
    this.reloading = true;
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, AppCtrl);
}
