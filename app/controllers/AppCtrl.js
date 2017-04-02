export const NAME = 'AppCtrl';

class AppCtrl {
  __deps;

  /* @ngInject */
  constructor(
    $log, wowProfile, $state, $scope
  ) {
    this.__deps = { $log, wowProfile };

    $scope.$watch(() => $state.current, (val) => {
      $log.debug('app ctrl $state', val);
    }, true);
  }
}
AppCtrl.$inject = ['$log', 'wowProfile', '$state', '$scope'];

export default function configure(ngModule) {
  ngModule.controller(NAME, AppCtrl);
}
