const axios = require('axios');

const getApiKeySet = require('./getApiKeySet');

const { clientId, clientSecret } = getApiKeySet();

module.exports = function getToken(db) {
  const ref = db.ref('blizzToken');

  /**
   * {
   *   token,
   *   expiresAt
   * }
   */

  /**
   * 檢查
   * - 有
   *   - 過期: 重拿
   *   - 未過期: 用
   * - 無: 重拿
   */

  const load = () => {
    ref.once('value').then((snapshot) => {
      // 不存在
      if (!snapshot.extists()) {
        return null;
      }

      // 過期
      const { expiresAt, token } = snapshot.val();
      if (expiresAt <= +new Date()) {
        return null;
      }

      return token;
    });
  };

  const fetchAndSave = () => {
    const oauthUrl = 'https://us.battle.net/oauth/token';
    const body = 'grant_type=client_credentials';
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: clientId,
        password: clientSecret
      }
    };
    return axios
      .post(oauthUrl, body, config)
      .then((res) => {
        return {
          token: res.data.access_token,
          expiresAt: +new Date() + (res.data.expires_in * 1000)
        };
      })
      .then((d) => {
        ref.update(d);
        return d.token;
      });
  };

  return load().then((loadToken) => {
    if (!loadToken) {
      return fetchAndSave();
    }
    return loadToken;
  });
};
