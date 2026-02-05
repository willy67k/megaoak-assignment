# OakMega 前端作業

## 目標：

用 React/Vue 做一個新北市都市更新地點的查詢網頁（如 demo），用戶查詢前必須先登入 Google 並且綁定 Facebook，部署至你熟悉的環境（如 Heroku or Github）

## 使用的 API

1. 附近的都更地點 API

- Endpoint：https://enterprise.oakmega.ai/api/v1/server/xinbei/calc-distance
- Method：POST
- Request Data：
  - lat：（float）緯度
  - lng：（float）經度
- Response Data：
  - stop_name：都更地點名稱
  - distance：都更地點距離

---

2. 都更地點 Polygon API

- Endpoint：https://enterprise.oakmega.ai/api/v1/server/xinbei/geolocation-json
- Method：GET
- Request Param：
  - directory：（string）帶入 tucheng.json
- Response Data：
  - 此為 Polygon 通用格式，自行研究並使用

## 作業完成條件

1. Google Login 與 Facebook Login 要用 「原生寫法」, 不要 firebase, 不要套件
2. 地圖呈現用 leaflet.js
3. 顯示 User Location Pin 的 tooltip 要顯示 facebook 與 google 大頭貼
4. 都更地點 API 回傳資料用 list 方式呈現到頁面也同步呈現到地圖上
5. 都更地點 Polygon API 回傳資料呈現到地圖上

## Scripts

```sh
yarn dev # 開發模式，啟動 Vite dev server

yarn build # 打包專案（包含型別檢查）

yarn build-only # 只打包專案，不做型別檢查

yarn preview # 預覽打包結果

yarn type-check # TypeScript 型別檢查

yarn lint # ESLint 檢查 JS/TS/Vue

yarn lint:fix # ESLint 自動修復

yarn lint:style # Stylelint 檢查 CSS/SCSS/Vue

yarn lint:style:fix # Stylelint 自動修復 CSS/SCSS/Vue

yarn format # Prettier 格式化整個專案
```
