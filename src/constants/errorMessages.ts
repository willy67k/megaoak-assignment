export const ERROR_MESSAGES = {
  MAP: {
    INIT_FAILED: "地圖初始化失敗",
    TILE_LOAD_FAILED: "地圖底圖載入失敗",
    POLYGON_LOAD_FAILED: "圖層載入錯誤",
    MARKER_RENDER_FAILED: "渲染 Marker 失敗",
    POPUP_OPEN_FAILED: "打開 popup 失敗",
    FLY_TO_FAILED: "無法飛往指定地點",
    LOCATION_GET_FAILED: "無法取得您的位置",
  },
  AUTH: {
    GOOGLE_SDK_LOAD_FAILED: "Google SDK 載入失敗",
    GOOGLE_LOGIN_FAILED: "Google 登入失敗",
    GOOGLE_DECODE_FAILED: "Google 登入解析發生錯誤",
    FACEBOOK_SDK_LOAD_FAILED: "Facebook SDK 載入失敗",
    FACEBOOK_SDK_NOT_READY: "Facebook SDK 未載入完成",
    FACEBOOK_LOGIN_CANCELLED: "Facebook 登入取消或失敗",
    FACEBOOK_LOGIN_ERROR: "Facebook 登入發生錯誤",
  },
  API: {
    FETCH_DATA_FAILED: "API 獲取資料失敗",
    FETCH_RENEWAL_POINTS_FAILED: "取得圖釘點失敗",
    FETCH_POLYGONS_FAILED: "取得多邊圖層失敗",
  },
} as const;
