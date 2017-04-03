import moment from 'moment';

export const NAME = 'timeAgo';

const template = '<span>{{$ctrl.relativeTime}}</span>';

class TimeAgoCtrl {
  static $inject = ['$scope', '$interval'];

  __deps;
  interval;
  relativeTime;
  momentInstance;

  /* @ngInject */
  constructor($scope, $interval) {
    this.__deps = { $scope, $interval };
  }

  $onChanges(obj) {
    const { $interval, $scope } = this.__deps;

    if (obj.time && obj.time.currentValue) {
      this.momentInstance = moment(obj.time.currentValue);
      this.relativeTime = this.momentInstance.fromNow();

      $interval.cancel(this.interval);
      this.interval = $interval(() => {
        this.relativeTime = this.momentInstance.fromNow();
        $scope.$digest();
      }, 1e3, 0, false);
    }
  }

  $onDestroy() {
    const { $interval } = this.__deps;
    $interval.cancel(this.interval);
  }
}

const component = {
  controller: TimeAgoCtrl,
  bindings: {
    time: '<'
  },
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
