export const NAME = 'raiderIO';

const RIO_CHARACTER_API = 'https://raider.io/api/v1/characters/profile';

/* @ngInject */
function factory($http) {
  return {
    realm: null,
    region: null,
    name: null,

    isLoading: false,
    isReady: false,
    data: null,

    query(region, realm, name) {
      this.data = null;
      this.isLoading = true;

      Object.assign(this, {
        region, realm, name
      });

      const params = {
        region,
        realm,
        name,
        fields: 'mythic_plus_scores'
      };
      $http.get(RIO_CHARACTER_API, { params })
      .then((res) => {
        if (region === this.region && realm === this.realm && this.name === name) {
          this.data = res.data;
        }
      })
      .finally(() => {
        if (region === this.region && realm === this.realm && this.name === name) {
          this.isLoading = false;
          this.isReady = true;
        }
      });
    }
  };
}
factory.$inject = ['$http'];

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
