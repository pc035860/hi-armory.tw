import { init as initFBApp, getDB } from './firebase';
import $ from 'jquery';

initFBApp();

$(() => {
  $('.js-check').on('click', function($evt) {
    const char = $('#character').val();
    const realm = $('#realm').val();

    const ref = getDB().ref('queue').push({
      character: char,
      realm: realm
    });

    console.log(`key: ${ref.key}`);
  });
});
