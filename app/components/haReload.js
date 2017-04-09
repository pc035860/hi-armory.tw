export const NAME = 'haReload';

const template = `
<div>
  <status-text status="$ctrl.status"
    class="ng-anim"
    ng-show="$ctrl.showStatus"></status-text>
  <md-button class="md-fab md-mini md-hue-2"
    ng-click="$ctrl.onClick({ $event: $event })"
    aria-label="refresh"><i class="fa fa-refresh"
    ng-class="{
      'fa-spin': $ctrl.spin
    }"></i></md-button>
</div>
`;

class HAReloadCtrl {}

const component = {
  controller: HAReloadCtrl,
  bindings: {
    status: '<',
    showStatus: '<',
    spin: '<',
    onClick: '&'
  },
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
