export const NAME = 'app';

const template = `
<div class="r-app">
  <div class="r-app__content" ng-transclude="content"></div>
  <div class="r-app__footer" ng-transclude="footer">
    <div class="md-caption c-footer-info">
      <a href="https://github.com/pc035860/hi-armory.tw" rel="noopener" target="_blank"><i class="fa fa-github-alt"></i>pc035860/hi-armory.tw</a>
    </div>
  </div>
</div>
`;

class AppCtrl { }

const component = {
  transclude: {
    content: 'appContent',
    footer: '?appFooter'
  },
  controller: AppCtrl,
  template,
};

export default function configure(ngModule) {
  ngModule.component(NAME, component);
}
