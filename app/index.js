import $ from 'jquery';
import { init as initFBApp, getDB } from './firebase';

initFBApp();

$(() => {
  $('.js-check').on('click', function ($evt) {
    const character = $('#character').val();
    const realm = $('#realm').val();
    const region = 'tw';

    getDB().ref('queue').push({
      region,
      character,
      realm,
      fields: 'items',
      timestamp: +new Date()
    });
  });
});
