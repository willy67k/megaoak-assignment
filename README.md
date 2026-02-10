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

# 開發過程

## 一、整體開發流程

1. 建立基本專案架構（Vue 3 + TypeScript）
2. 導入 Leaflet，完成地圖初始化與基本操作
3. 實作使用者定位與地圖 Marker 呈現
4. 整合 Api 資料（Renewal Points、Polygon GeoJSON）
5. 引入 Google / Facebook 雙重登入流程
6. 優化 Marker 與 List 呈現方式
7. 新增 List 置中選取點互動
8. 處理錯誤狀況、安全性與部署問題

---

## 二、地圖與 Vue 響應式系統的取捨

### 問題

Leaflet 本身是 imperative library，內部狀態（Map / Layer / Marker）不適合被 Vue 深度追蹤。

若直接使用 `ref` 或 `reactive`，會導致：

- 地圖重複初始化
- Layer 被非預期銷毀
- 出現 `_latLngToNewLayerPoint` 等 runtime error

### 解法與取捨

- 地圖與 Layer instance 一律使用 `shallowRef`
- 不在 `onMounted` 強制初始化所有地圖相關邏輯
- 改以 `watch(mapRef)` 等待 map ready 後再掛載圖層

### Trade-off

- 失去 Vue 深層響應式的便利性
- 換取 Leaflet 行為可預測、效能穩定

## 三、大量資料呈現與效能考量

### 地圖端（Marker）

- 使用 leaflet.markercluster 將相同或鄰近 Marker 聚合
- 避免在地圖縮放時造成視覺與效能負擔

### 清單端（List）

- 將 Renewal Points 依名稱分組
- 降低使用者在列表中的認知負擔
- 保留後續可擴充「展開 / 收合」的彈性

### Trade-off

- 分組後需額外處理 UI 邏輯
- 但可顯著改善使用體驗與可讀性

## 四、雙重身分驗證流程設計

### 設計原則

- 使用者需同時完成 Google 與 Facebook 登入
- 但 UI 不強制登入順序
- 狀態由 isFullyAuthed 統一判斷

### Trade-off

- 換取使用流程彈性與較佳 UX

## 五、HTML Tooltip 與安全性（XSS）

### 問題

Leaflet Tooltip 需直接插入 HTML 字串，且內容來自第三方登入資訊（名稱、頭像）。

### 解法

- 使用 DOMPurify 對 tooltip HTML 進行 sanitize
- 僅允許安全標籤與屬性

### Trade-off

- 增加額外套件與處理成本
- 換取避免 XSS 攻擊風險，符合 production 使用情境

## 六、錯誤處理策略

### 目前做法

- 使用 toast 顯示使用者可理解的錯誤訊息
- 僅在開發模式輸出詳細錯誤 log

### Trade-off

- 初期開發成本較高
- 但可避免錯誤直接暴露給使用者，並利於後續維護

## 七、部署平台選擇與限制

### GitHub Pages 問題

- 不支援 SPA history fallback
- 直接訪問子頁會出現 404

### 決策

- 專案仍可部署於 GitHub Pages
- 額外選擇 Vercel 支援 SPA rewrite 的平台部署

### Trade-off

- GitHub Pages 設定簡單、無成本
- 但在 routing 與資產管理上限制較多
- 多部署在 Vercel 可解決問題

## 八、Constants 與 Types 集中管理

### Error / Message 標準化

- 避免 magic string
- 未來可無痛改為 i18n
- toast / modal / log 可共用同一組訊息來源

### Types 集中管理

- 模組及套件只關心邏輯
- 型別定義不散落在業務程式碼中

### Trade-off

- 降低耦合、提升可維護性
- 初期檔案數量增加
- 小型專案可能顯得「過度設計」
