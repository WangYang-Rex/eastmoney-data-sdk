/**
 * Eastmoney Data SDK
 * 
 * 东方财富数据 SDK - 获取 A 股历史 K 线、实时行情、分时线等数据
 * 
 * @packageDocumentation
 */

// ==================== 导出客户端 ====================
export { EastmoneyClient, eastmoney } from './client';

// ==================== 导出所有类型 ====================
export * from './types';

// ==================== 导出配置 ====================
export {
  EASTMONEY_BASE,
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT,
  DEFAULT_THROTTLE_MS,
  MARKET_CODE,
  KLINE_PERIOD,
  FQ_TYPE
} from './config';

// ==================== 导出 API 函数 ====================
export {
  // K 线 API
  getKLine,
  getDailyKLine,
  getWeeklyKLine,
  getMonthlyKLine,
  getMinuteKLine,
  getBatchKLine,
  // 实时行情 API
  getQuote,
  getQuoteBySecid,
  getBatchQuote,
  getQuoteCore,
  // 分时 API
  getTrend,
  getIntradayTrend,
  get5DayTrend,
  getBatchTrend,
  calculateAveragePrice,
  getTrendHighLow,
  // 股票列表 API
  getStockList,
  getAShareList,
  getETFList,
  getChiNextList,
  getStarList,
  getTopGainers,
  getTopLosers,
  getTopVolume,
  getTopTurnover,
  toStockInfo,
  SECTOR_CODE
} from './api';

// ==================== 导出工具函数 ====================
export {
  // HTTP 请求
  http,
  createHttpClient,
  withRetry,
  // 限流
  throttle,
  resetThrottle,
  createThrottler,
  // 解析器
  parseKLines,
  parseQuote,
  parseTrends,
  formatNumber,
  formatLargeNumber,
  // 辅助函数
  buildSecid,
  detectMarket,
  parseSecid,
  formatDate,
  getDaysAgo,
  isTradingDay,
  isTradingTime,
  sleep,
  batchProcess,
  formatTimestamp,
  timestampToDate
} from './utils';

// ==================== 导出股票列表类型 ====================
export type { StockListItem, StockListOptions } from './api/stocklist';
