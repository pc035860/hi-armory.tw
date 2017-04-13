const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.dequeueByQueue = require('./dequeueByQueue')(admin);
exports.dequeueByResource = require('./dequeueByResource')(admin);
exports.saveIndexToStorage = require('./saveIndexToStorage')(admin);
exports.dequeueWcl = require('./dequeueWcl')(admin);
