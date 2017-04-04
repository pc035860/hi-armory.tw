export const NAME = 'statusText';

const template = '<span>{{$ctrl.STATUS[$ctrl.status]}}</span>';

class StatusTextCtrl {
  STATUS;

  $onInit() {
    this.STATUS = {
      pending: '排隊中',
      processing: '查詢中',
      'not found': '沒有資料',
      ready: '完成'
    };
  }
}

const component = {
  controller: StatusTextCtrl,
  bindings: {
    status: '<'
  },
  template
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
