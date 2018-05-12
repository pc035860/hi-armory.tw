// https://twitter.com/inlined/status/982277528751489025
// require firebase functions for now
const functions = require('firebase-functions'); // eslint-disable-line
const admin = require('firebase-admin');

admin.initializeApp();

exports.dequeueByQueue = require('./dequeueByQueue')(admin);
exports.dequeueByResource = require('./dequeueByResource')(admin);
exports.saveIndexToStorage = require('./saveIndexToStorage')(admin);
exports.dequeueWcl = require('./dequeueWcl')(admin);
exports.legionAssultTime = require('./legionAssultTime')();
exports.armoryQuery = require('./armoryQuery')(admin);
exports.saveArmoryIndexToStorage = require('./saveArmoryIndexToStorage')(admin);
