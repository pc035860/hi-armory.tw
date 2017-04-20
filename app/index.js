/* global navigator */
/* eslint no-console: 0 */

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

(function () {
  // Check for browser support of serviceWorker
  if (!('serviceWorker' in navigator)) {
    console.log('Service worker not supported');
    return;
  }
  navigator.serviceWorker.register('/sw.js')
  .then(function (registration) {
    // Successful registration
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function (error) {
    // Failed registration, service worker won't be installed
    console.log('Service worker registration failed, error:', error);
  });
}());
