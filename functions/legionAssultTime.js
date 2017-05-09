const functions = require('firebase-functions');
const cors = require('cors');

const BASE = functions.config().legionassult.base;

const base = parseInt(+new Date(BASE) / 1000, 10);
const calcAssultTime = require('./utils/calcAssultTime')(base);

const corsOptions = {
  origin: true,
  methods: 'GET',
  exposedHeaders: 'Date'
};

module.exports = function legionAssultTime() {
  return functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
      res.status(403).send('Forbidden!');
    }

    (cors(corsOptions))(req, res, () => {
      /**
       * api parameters
       *
       * start - starting time (any Date object formate)
       * count - number of assult times returned
       * callback - jsonp support callback function name
       */

      const startFrom = (
        req.query.start
        ? +new Date(req.query.start)
        : +new Date()
      ) / 1000;

      const count = Number(req.query.count || 5);

      const assults = calcAssultTime(startFrom, count);

      res
      .status(200)
      .set({
        'Cache-Control': 'public, max-age=3600'
      })
      .jsonp({
        start: startFrom,
        count,
        assults
      });
    });
  });
};
