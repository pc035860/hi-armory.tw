import angular from 'angular';

import { realms as REALMS } from '../config';

const AUTO_REQUERY_DIFF = 86400 * 1000;  // auto re-query

const DEFAULT_REGION = 'tw';

export const NAME = 'AppCtrl';

class AppCtrl {
  static $inject = [
    '$log', '$scope', '$state', 'wowProfile', 'parseProfile', 'ga', '$location',
    'charIndex', '$mdMedia', 'closeKeyboard', '$window', 'realmName', 'wclId'
  ];

  __deps;
  REALMS;
  profile;
  wclId;
  region;
  realm;
  character;
  autocompleteItem;
  reloading;
  pp;  // parsedProfile
  pd;  // profile.data

  /* @ngInject */
  constructor(
    $log, $scope, $state, wowProfile, parseProfile, ga, $location,
    charIndex, $mdMedia, closeKeyboard, $window, realmName, wclId
  ) {
    $scope.ga = ga;

    this.region = DEFAULT_REGION;
    this.fields = 'items,progression,talents';
    this.REALMS = REALMS;

    const rn = realmName(this.region);

    this.__deps = { $log, wowProfile, ga, charIndex, $window, rn };

    $scope.$watch(() => $state.params, (val, oldVal) => {
      const region = this.region;
      const { realm: rawRealm, character } = val;

      $log.debug('val', rawRealm, character);

      const requireNewProfile = !angular.equals(val, oldVal);

      if (this.profile && requireNewProfile) {
        this.profile.$destroy();
      }

      if (region && rawRealm && character) {
        const realm = rn.isEn(rawRealm) ? rn.toLocaled(rawRealm) : rawRealm;
        Object.assign(this, {
          region,
          realm,
          character
        });

        if (requireNewProfile) {
          closeKeyboard();

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

          this.wclId = wclId.getFirebaseObject({ region, realm, character });

          this.wclId.$loaded()
          .then((obj) => {
            if (!obj.$value) {
              wclId.enqueue({
                region,
                realm,
                character
              });
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
        if (val.status !== oldVal.status) {
          // 只是介面上的 reloading 意味
          this.reloading = false;
        }
      }

      if (val && val.status && val.status === 'ready') {
        charIndex.addHistory(`${this.region}-${this.realm}-${this.character}`);
      }
    }, true);

    $scope.$watch(() => $mdMedia('xs'), (xs) => {
      this.mqXS = xs;
    });

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

  indexSearch(str) {
    const { charIndex } = this.__deps;
    return charIndex.search(str);
  }

  handleSelectedItemChange(item) {
    if (!item) {
      return;
    }
    const { region, realm } = item;
    Object.assign(this, { region, realm });
    this.query();
  }

  outbound(target) {
    const { $window, rn, ga } = this.__deps;

    const enRealmName = rn.toEn(this.realm);
    const realm = encodeURIComponent(this.realm);
    const character = encodeURIComponent(this.character);

    let link;

    switch (target) {
      case 'armory':
        link = `http://${this.region}.battle.net/wow/zh/character/${realm}/${character}/advanced`;
        break;
      case 'wowprogress':
        link = `https://www.wowprogress.com/character/${this.region}/${enRealmName}/${character}`;
        break;
      case 'warcraftlogs':
        link = `https://www.warcraftlogs.com/rankings/character/${this.wclId.$value}/latest/`;
        break;
      default:
        break;
    }

    if (link) {
      $window.open(link);
    }

    ga.event('Outbound Link', 'click', target);
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, AppCtrl);
}
