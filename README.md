# 嗨... 英雄榜 hi-armory.tw

__不一樣的英雄榜__

初衷只是為了方便查詢神器特質等級，不想再大老遠跑到難用的 WoWProgress 去查。

## 準備工作

首先必須把 `firebase-tools` 裝好。

```sh
npm install -g firebase-tools
```

以及 [Google Cloud SDK](https://cloud.google.com/sdk/docs/)。

初次使用可能會提示你下一些登入用的指令，照做就好囉！

### Firebase

修改 `app/config.js` 的內容，換成你的設定。

`apiKey` 可以在 [專案 console -> [設定] -> [一般]](https://console.firebase.google.com/project/_/settings/general/) 裡面找到。

```js app/config.js
export const firebase = {
  apiKey: '{你的 API key}',
  authDomain: '{你的專案名稱}.firebaseapp.com',
  databaseURL: 'https://{你的專案名稱}.firebaseio.com'
};
```

### Firebase Admin SDK

為了在 server 或是 本地 使用某些 admin 權限的操作，需要透過這個 SDK JSON 認證為服務帳戶。

產生方法是到 [專案 console -> [設定] -> 服務帳戶](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk)，透過 `產生新的私密金鑰` 取得 JSON 檔案。

- 目前 Cloud Functions 上操作 Firebase Storage 的部分需要透過此 SDK 認證才能操作，因此需要擺一個在 `./functions/firebase-adminsdk.json`
- 再來如果你有需要使用到 `utils/createIndex.js`，需要擺一個在專案目錄底下 `./firebase-adminsdk.json`


### Cloud Functions for Firebase

以下的 cloud functions 的環境設定必須完成才能運作

```json
{
  "project": {
    "id": "{project id}",
    "bucket": "{bucket name}"
  },
  "resource": {
    "total": "10"
  },
  "bnetapi": {
    "key1": "{key1}",
    "key2": "{key2}",
    "key3": "{key3}",
    ...
  },
  "wclapi": {
  	"key": "{key}"
  }
}
```

| 設定名稱       | 敘述                                           |
|----------------|------------------------------------------------|
| project.id     | firebase project id                            |
| project.bucket | firebase storage bucket name                   |
| resource.total | 同時可以運行的 bnet api request 數量           |
| bnetapi.key{n} | n = 1..10。至多可以設定10組 battle.net API key |
| wclapi.key     | Warcraft Logs API key                          |

設定方法

```sh
firebase functions:config:set project.id="your project id"
```

battle.net API 申請請前往 https://dev.battle.net/。

WCL API 申請請前往 https://www.warcraftlogs.com/accounts/changeuser (需登入)。

設定相關文件可以看 [Cloud Functions: Environment Configuration](https://firebase.google.com/docs/functions/config-env)。


### Google Cloud Storage

因為 Firebase Storage 其實就是 Google Cloud Storage，所有一些 Firebase console 下沒有提供的操作，我們需要透過 `gsutil` 來進行。

#### 設定 `gs://hi-armory-tw` 的 CORS

```sh
# 在專案根目錄下
gsutil cors set cors-json-file.json gs://hi-armory-tw
```

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


## 工具

### `createIndex.js`

用目前現有 `results` 內的資料，重新建立一次 `index`。

一般來說是在 `results` 跟 `index` 沒有同步的時候使用。
