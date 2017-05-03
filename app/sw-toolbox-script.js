/* global self */
(function (global) {
  const toolbox = global.toolbox;

  // toolbox.options.debug = true;

  /**
   * Cache first
   */

  // cloudflare cdn
  toolbox.router.get('/(.*)', toolbox.cacheFirst, {
    cache: {
      name: 'cloudflare-cdn',
    },
    origin: /cdnjs\.cloudflare\.com$/
  });

  // gstatic cdn
  // - firebase scripts
  // - google fonts
  toolbox.router.get('/(.*)', toolbox.cacheFirst, {
    cache: {
      name: 'gstatic-cdn',
    },
    origin: /\.gstatic\.com$/
  });

  // googleapis fonts cdn
  // - google fonts css
  toolbox.router.get('/(.*)', toolbox.cacheFirst, {
    cache: {
      name: 'fonts-googleapis-cdn'
    },
    origin: /fonts\.googleapis\.com/
  });

  // github buttons cdn
  toolbox.router.get('/(.*)', toolbox.cacheFirst, {
    cache: {
      name: 'github-buttons-cdn-600',
      maxAgeSeconds: 600
    },
    origin: /buttons\.github\.io/
  });

  // cloud functions legion assult api
  toolbox.router.get(/\/legionAssultTime/, toolbox.cacheFirst, {
    cache: {
      name: 'legion-assults-time-86400',
      maxAgeSeconds: 86400
    },
    origin: /us-central1-wow-ap-level\.cloudfunctions\.net/
  });


  /**
   * Fastest
   */

  // worldofwarcraft character render
  toolbox.router.get(/character\/(.*?)\.jpg/, toolbox.fastest, {
    cache: {
      name: 'worldofwarcraft-render',
      maxEntries: 50,
      maxAgeSeconds: 86400
    },
    origin: /render-(?:tw|eu|us|kr)\.worldofwarcraft\.com/
  });

  // firebase storage character index
  toolbox.router.get(/index\.json/, toolbox.fastest, {
    origin: /firebasestorage\.googleapis\.com/
  });
}(self));
