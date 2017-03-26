import { init as initFBApp, getDB } from './firebase';
import $ from 'jquery';

initFBApp();

$(() => {
  $('.js-check').on('click', function($evt) {
    const character = $('#character').val();
    const realm = $('#realm').val();
    const region = 'tw';

    const armoryKey = [region, realm, character, 'items'].join('-');

    getDB().ref('queue').push({
      region,
      character,
      realm,
      fields: 'items',
      timestamp: +new Date
    });
  });
});
