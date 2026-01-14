/**
 * Eastmoney Data SDK - 全局配置
 * 
 * 包含所有 API 端点地址、默认请求头和超时设置
 */

// ==================== API 端点配置 ====================

/**
 * 东方财富 API 基础地址
 */
export const EASTMONEY_BASE = {
  /** 历史 K 线 API */
  KLINE: "https://push2his.eastmoney.com/api/qt/stock/kline/get",

  /** 实时行情 API */
  QUOTE: "https://push2.eastmoney.com/api/qt/stock/get",

  /** 分时线 API（当日分时） */
  TRENDS: "https://push2.eastmoney.com/api/qt/stock/trends2/get",

  /** 分钟线 API（历史分钟 K 线） */
  MINUTE: "https://push2his.eastmoney.com/api/qt/stock/kline/get",

  /** 股票列表 API */
  STOCK_LIST: "https://push2.eastmoney.com/api/qt/clist/get",

  /** 板块列表 API */
  SECTOR_LIST: "https://push2.eastmoney.com/api/qt/clist/get"
} as const;

// ==================== 请求配置 ====================

/**
 * 默认请求头
 * 模拟浏览器请求，避免被反爬
 */
export const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://quote.eastmoney.com/",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
} as const;

/**
 * 默认请求超时时间（毫秒）
 */
export const DEFAULT_TIMEOUT = 10_000;

/**
 * 默认限流间隔（毫秒）
 */
export const DEFAULT_THROTTLE_MS = 300;

// ==================== 市场配置 ====================

/**
 * 市场代码映射
 * 用于构建 secid 参数
 */
export const MARKET_CODE = {
  /** 上海证券交易所 */
  SH: 1,
  /** 深圳证券交易所 */
  SZ: 0,
  /** 北京证券交易所 */
  BJ: 0
} as const;

/**
 * K 线周期类型
 */
export const KLINE_PERIOD = {
  /** 1 分钟 */
  MIN_1: 1,
  /** 5 分钟 */
  MIN_5: 5,
  /** 15 分钟 */
  MIN_15: 15,
  /** 30 分钟 */
  MIN_30: 30,
  /** 60 分钟 */
  MIN_60: 60,
  /** 日线 */
  DAILY: 101,
  /** 周线 */
  WEEKLY: 102,
  /** 月线 */
  MONTHLY: 103
} as const;

/**
 * 复权类型
 */
export const FQ_TYPE = {
  /** 不复权 */
  NONE: 0,
  /** 前复权 */
  QFQ: 1,
  /** 后复权 */
  HFQ: 2
} as const;
