# jq_samegame



## 前提
参考：
https://cordova.apache.org/docs/ja/latest/guide/cli/
node,npmはインストール済み

### android
https://cordova.apache.org/docs/ja/latest/guide/platforms/android/index.html
AndroidStudio,Android SDKのインストール済み

### ios
https://cordova.apache.org/docs/ja/latest/guide/platforms/ios/index.html
Xcodeのインストール済み

## 初期化
###
npm i

プラットフォーム追加
### ブラウザ
cordova platform add browser

### ios
cordova platform add ios

### android
cordova platform add android

## ビルド
### ブラウザで実行
gulp; npm run browser

### ブラウザで開発する場合のサーバー
npm run serv

### android
gulp; npm run android

### androidで直接実行
gulp; cordova build android
