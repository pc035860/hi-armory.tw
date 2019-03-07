import template from './bfaAssults.html';
import { bfaAssultsApi as ASSULTS_API } from '../config';

export const NAME = 'bfaAssults';

class BFAAssultsCtrl {
  static $inject = ['$scope', '$interval', '$http'];

  data;
  interval;
  isReady;
  now;
  assulting;
  upcoming;

  constructor($scope, $interval, $http) {
    this.__deps = { $scope, $interval, $http };
  }

  $onInit() {
    const { $http, $interval, $scope } = this.__deps;

    const params = { count: 10 };
    $http.get(ASSULTS_API, { params })
    .then((res) => {
      this.data = res.data;
      this.isReady = true;
      this.update();

      // auto local digest interval
      this.interval = $interval(() => {
        this.update();
        $scope.$digest();
      }, 1e3, 0, false);
    });
  }

  update() {
    if (!this.isReady) {
      return;
    }
    this.assulting = false;

    const now = parseInt(+new Date() / 1000, 10);
    const upcoming = [];
    this.data.assults.forEach(({ start, end }) => {
      if (now >= start && now < end) {
        this.assulting = {
          start: start * 1000,
          end: end * 1000
        };
      }
      else if (start > now) {
        upcoming.push({
          start: start * 1000,
          end: end * 1000
        });
      }
    });

    this.upcoming = upcoming.slice(0, 3);
    this.now = now;
  }

  $onDestroy() {
    const { $interval } = this.__deps;
    $interval.cancel(this.interval);
  }
}

const component = {
  controller: BFAAssultsCtrl,
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
