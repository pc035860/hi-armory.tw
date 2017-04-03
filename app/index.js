import angular from 'angular';

import { init as initFBApp } from './firebase';

import configs from './configs';
import services from './services';
import filters from './filters';
import components from './components';
import controllers from './controllers';

import './sass/index.scss';

const ngAppName = 'wowApLevelApp';

const ngModule = angular.module(ngAppName, [
  'ngAnimate',
  'ui.router',
  'firebase',
  'ngMaterial'
]);

configs(ngModule);
services(ngModule);
filters(ngModule);
components(ngModule);
controllers(ngModule);

initFBApp();

/* @ngInject */
function run() { }

ngModule.run(run);
