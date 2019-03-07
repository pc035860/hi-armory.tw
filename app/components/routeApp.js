import angular from 'angular';

import find from 'lodash/find';
import trim from 'lodash/trim';

import { realms as REALMS, enRealmNames as EN_REALM_NAMES } from '../config';
import template from './routeApp.html';

export const NAME = 'routeApp';

const AUTO_REQUERY_DIFF = 86400 * 1000; // auto re-query

const KEY_BFA_ASSULT = 'bfaAssult';
const DEFAULT_REGION = 'tw';

class Ctrl {
  static $inject = [
    '$log',
    '$scope',
    '$state',
    'wowProfile',
    'parseProfile',
    'ga',
    '$location',
    'charIndex',
    '$mdMedia',
    'closeKeyboard',
    '$window',
    'realmName',
    'wclId',
    '$timeout',
    'fixCharacterName',
    'raiderIO'
  ];

  __deps;
  _realmSearchList = {};
  REALMS;
  profile;
  wclId;
  region;
  realm;
  character;
  autocompleteItem = {
    realm: null,
    character: null
  };
  reloading;
  pp; // parsedProfile
  pd; // profile.data
  bfaAssult;

  /* @ngInject */
  constructor(
    $log,
    $scope,
    $state,
    wowProfile,
    parseProfile,
    ga,
    $location,
    charIndex,
    $mdMedia,
    closeKeyboard,
    $window,
    realmName,
    wclId,
    $timeout,
    fixCharacterName,
    raiderIO
  ) {
    $scope.ga = ga;

    this.rio = raiderIO;

    this.region = DEFAULT_REGION;
    this.fields = 'items,progression,talents';
    this.REALMS = REALMS;

    this.bfaAssult = (() => {
      const saved = $window.localStorage.getItem(KEY_BFA_ASSULT);
      if (!saved || saved === 'true') {
        return true;
      }
      return false;
    })();

    const rn = realmName(this.region);

    this.__deps = {
      $log,
      wowProfile,
      ga,
      charIndex,
      $window,
      rn,
      $scope,
      $timeout,
      fixCharacterName,
      raiderIO
    };

    $scope.$watch(
      () => $state.params,
      (val, oldVal) => {
        const region = this.region;
        const { realm: rawRealm, character: character_ } = val;

        const character = fixCharacterName(character_);

        const requireNewProfile = !angular.equals(val, oldVal) || !this.profile;

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

          raiderIO.query(region, realm, character);

          if (requireNewProfile) {
            closeKeyboard();

            this.profile = wowProfile.getFirebaseObject({
              region,
              realm,
              character,
              fields: this.fields
            });

            this.profile.$loaded().then((obj) => {
              if (!obj.data && obj.status !== 'not found') {
                // no data, trigger first-time query
                this.query({ enqueue: true });
              }
              else if (+new Date() - obj.dataUpdatedAt > AUTO_REQUERY_DIFF) {
                // auto re-query
                this.query({ enqueue: true });
              }
            });

            this.wclId = wclId.getFirebaseObject({ region, realm, character });

            this.wclId.$loaded().then((obj) => {
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
          if (this.profile) {
            this.profile.$destroy();
          }
          this.profile = null;
        }
      }
    );

    $scope.$watch(
      () => this.profile,
      (val, oldVal) => {
        if (val && val.data && typeof val.data !== 'string') {
          this.pp = parseProfile(val.data); // parsedProfile
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
      },
      true
    );

    $scope.$watch(
      () => $mdMedia('xs'),
      (xs) => {
        this.mqXS = xs;
      }
    );

    $scope.$watch(
      () => this.character,
      (val, oldVal) => {
        if (val === oldVal) {
          return;
        }

        /**
         * 處理特殊格式: {角色名稱}-{伺服器名稱}
         */
        if (/^.+?-.+?$/.test(val)) {
          const m = this.character.match(/^(.+?)-(.+?)$/);

          const pRealm = trim(m[2]);
          const pChar = fixCharacterName(trim(m[1]));

          // 只在 realm 也有 match 的時候做自動帶入
          if (find(REALMS[this.region], v => v[0] === pRealm)) {
            this.realm = pRealm;
            this._updateSelectedRealmItem(this.region, pRealm);
            this.character = pChar;
          }
        }
      }
    );

    $scope.$watch(() => this.bfaAssult, (val, oldVal) => {
      if (val !== oldVal) {
        $window.localStorage.setItem(KEY_BFA_ASSULT, val ? 'true' : 'false');
      }
    });

    $scope.$on('$stateChangeSuccess', () => {
      ga.pageview($location.path());
    });
  }

  $onDestroy() {
    if (this.profile) {
      this.profile.$destroy();
    }
  }

  /**
   * Query
   * @param  {object} options   { bool: enqueue  }
   */
  query(options_) {
    const { $scope, wowProfile, fixCharacterName, raiderIO } = this.__deps;

    if ($scope.armoryForm && $scope.armoryForm.$invalid) {
      return;
    }

    const { region, realm, character: character_ } = this;
    const character = fixCharacterName(character_);

    // re-apply trimmed character name
    this.character = character;

    if (!region || !realm || !character) {
      return;
    }

    if (
      this.profile &&
      this.profile.$resolved &&
      this.profile.status !== 'ready' &&
      this.profile.status !== 'not found' &&
      this.profile.$value !== null
    ) {
      return;
    }

    const options = {
      ...{ enqueue: false },
      ...(options_ || {})
    };

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

    // raiderIO query
    raiderIO.query(region, realm, character);
  }

  reload() {
    this.query({ enqueue: true });
    this.reloading = true;
  }

  _updateSelectedRealmItem(region, realm) {
    const [local, preEn] = find(this.REALMS[this.region], v => v[0] === realm);
    this.autocompleteItem.realm = Ctrl.getRealmItem(local, preEn);
  }

  realmSearch(str) {
    const realms = this.REALMS[this.region];
    // 建立內部搜尋用的 map
    if (!this._realmSearchList[this.region]) {
      this._realmSearchList[this.region] = realms.map(([local, preEn]) => {
        const en = EN_REALM_NAMES[preEn].split(' ').join('');
        return `${local}${en}`;
      });
    }

    const re = new RegExp(str, 'i');
    return realms
      .filter((v, i) => re.test(this._realmSearchList[this.region][i]))
      .map(([local, preEn]) => {
        return Ctrl.getRealmItem(local, preEn);
      });
  }

  indexSearch(str) {
    const { charIndex } = this.__deps;
    return charIndex.search(str);
  }

  handleSelectedRealmItemChange(item) {
    if (!item) {
      return;
    }
    const realm = item.local;
    Object.assign(this, { realm });
  }

  handleSelectedCharacterItemChange(item) {
    if (!item) {
      return;
    }
    const { $timeout } = this.__deps;
    const { region, realm } = item;
    Object.assign(this, { region, realm });

    this._updateSelectedRealmItem(region, realm);

    $timeout(() => {
      this.query();
    });
  }

  outboundLink(target) {
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
        link = `https://www.warcraftlogs.com/character/${this.region}/${realm}/${character}`;
        break;
      default:
        break;
    }

    return link;
  }

  static getRealmItem(local, preEn) {
    const en = EN_REALM_NAMES[preEn];
    return {
      local,
      en
    };
  }
}

const component = {
  controller: Ctrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
