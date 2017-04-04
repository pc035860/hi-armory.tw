# hi-armory.tw

__不一樣的英雄榜__

初衷只是為了方便查詢神器特質等級。

## 準備工作

首先必須把 `firebase-tools` 裝好。

```sh
npm install -g firebase-tools
```

初次使用可能會提示你下一些登入用的指令，照做就好囉！

### Firebase

修改 `app/config.js` 的內容，換成你的設定。

`apiKey` 可以在 [專案 console -> [設定] -> [一般]](https://console.firebase.google.com/project/wow-ap-level/settings/general/) 裡面找到。

```js app/config.js
export const firebase = {
  apiKey: '{你的 API key}',
  authDomain: '{你的專案名稱}.firebaseapp.com',
  databaseURL: 'https://{你的專案名稱}.firebaseio.com'
};
```

### Cloud Functions for Firebase

有兩項 cloud functions 的環境設定必須完成才能運作

```json
{
  "resource": {
    "total": "10"
  },
  "bnetapi": {
    "key1": "{key1}",
    "key2": "{key2}",
    "key3": "{key3}",
    ...
  }
}
```

設定 `resource.total` 的方法

```sh
firebase functions:config:set resource.total=10
```

設定 `bnetapi.key{n}` 的方法 (`n` 至多為 `10`)

```sh
firebase functions:config:set bnetapi.key1="aaa" bnetapi.key1="bbb"
```

battle.net API 申請請前往 https://dev.battle.net/。

設定相關文件可以看 [Cloud Functions: Environment Configuration](https://firebase.google.com/docs/functions/config-env)。


## Install

在主目錄 跟 `functions/` 目錄都需要做一次。

```sh
npm install

# 或

yarn install
```


## Develop

```sh
# dev server (有顏色)
node fuse.js

# dev server (沒有顏色)
npm start

# 接著瀏覽 http://localhost:4444
```

### 利用 `firebase-tools` 來測試 `html5Mode`

因為 [fuse-box](https://github.com/fuse-box/fuse-box) 自帶的 dev server 沒有提供 rewrites 功能，可以透過 `firebase serve` 來實現。

修改 `firebase.json`，將 `hosting.public` 的值改為 `public`。

```sh
firebase serve

# 接著瀏覽 http://localhost:5000
# fuse-box 的 dev server 必須要保持開著才能順利運作
```

## Build & Deploy

```sh
# build
npm run dist

# deploy everything
firebase deploy

# deploy just functions
firebase deploy --only functions

# deploy just hosting
firebase deploy --only hosting
```

