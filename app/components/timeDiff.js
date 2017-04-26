import moment from 'moment';

export const NAME = 'timeDiff';

const template = '<span ng-attr-title="{{$ctrl.time|date:\'yyyy/M/d HH:mm:ss\'}}">{{$ctrl.relativeTime}}</span>';

class TimeDiffCtrl {
  static $inject = ['$scope', '$interval'];

  __deps;
  interval;
  relativeTime;
  momentInstance;

  /* @ngInject */
  constructor($scope, $interval) {
    this.__deps = { $scope, $interval };
  }

  getRelativeTime(mode) {
    if (mode === 'calendar') {
      const currentWeekDay = moment().weekday();
      const calendarConfig = {
        sameDay : '[今天]Ahh:mm',
        nextDay : '[明天]Ahh:mm',
        nextWeek() {
          const weekday = this.weekday();
          if (weekday < currentWeekDay) {
            return '[下]ddddAhh:mm';
          }
          return 'ddddAhh:mm';
        },
        lastDay : '[昨天]Ahh:mm',
        lastWeek : '[上]ddddAhh:mm',
        sameElse : 'L'
      };
      return this.momentInstance.calendar(null, calendarConfig);
    }

    if (mode === 'duration') {
      const now = +new Date();
      const instance = this.momentInstance.valueOf();
      const format = instance - now > 3600000 ?
        'h小時m分鐘' :
        'm分鐘s秒';
      return moment.duration(instance - now).format(format);
    }

    return this.momentInstance.fromNow();
  }

  $onChanges(obj) {
    const { $interval, $scope } = this.__deps;

    if (obj.time && obj.time.currentValue) {
      this.momentInstance = moment(obj.time.currentValue);
      this.relativeTime = this.getRelativeTime(this.mode);

      $interval.cancel(this.interval);
      this.interval = $interval(() => {
        this.relativeTime = this.getRelativeTime(this.mode);
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
  controller: TimeDiffCtrl,
  bindings: {
    time: '<',
    mode: '@'
  },
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
