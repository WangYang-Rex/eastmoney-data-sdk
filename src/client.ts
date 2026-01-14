/**
 * Eastmoney Data SDK - 客户端主入口
 * 
 * 提供统一的 API 调用入口
 */

import {
  getKLine,
  getDailyKLine,
  getWeeklyKLine,
  getMonthlyKLine,
  getMinuteKLine,
  getBatchKLine
} from './api/kline';

import {
  getQuote,
  getQuoteBySecid,
  getBatchQuote,
  getQuoteCore
} from './api/quote';

import {
  getTrend,
  getIntradayTrend,
  get5DayTrend,
  getBatchTrend,
  calculateAveragePrice,
  getTrendHighLow
} from './api/intraday';

import {
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
} from './api/stocklist';

import { buildSecid, detectMarket, parseSecid } from './utils/helper';
import { KLineOptions, KLine } from './types/kline';
import { Quote, TrendResult, TrendData } from './types/quote';
import { StockListItem } from './api/stocklist';

/**
 * Eastmoney Data SDK 客户端
 * 
 * 提供统一的 API 调用接口，方便使用和管理
 * 
 * @example
 * ```ts
 * import { EastmoneyClient } from 'eastmoney-data-sdk';
 * 
 * const client = new EastmoneyClient();
 * 
 * // 获取 K 线
 * const klines = await client.kline({ secid: '1.600519', limit: 100 });
 * 
 * // 获取实时行情
 * const quote = await client.quote('1.600519');
 * 
 * // 获取分时
 * const trend = await client.trend('1.600519');
 * 
 * // 使用工具方法
 * const secid = client.utils.buildSecid('600519');  // => '1.600519'
 * ```
 */
export class EastmoneyClient {
  // ==================== K 线 API ====================

  /**
   * 获取 K 线数据（支持多种周期和复权方式）
   */
  kline = getKLine;

  /**
   * 获取日线数据（前复权）
   */
  dailyKline = getDailyKLine;

  /**
   * 获取周线数据
   */
  weeklyKline = getWeeklyKLine;

  /**
   * 获取月线数据
   */
  monthlyKline = getMonthlyKLine;

  /**
   * 获取分钟线数据
   */
  minuteKline = getMinuteKLine;

  /**
   * 批量获取 K 线数据
   */
  batchKline = getBatchKLine;

  // ==================== 实时行情 API ====================

  /**
   * 获取实时行情（完整数据）
   */
  quote = getQuoteBySecid;

  /**
   * 获取实时行情（详细选项）
   */
  getQuote = getQuote;

  /**
   * 获取实时行情（核心数据）
   */
  quoteCore = getQuoteCore;

  /**
   * 批量获取实时行情
   */
  batchQuote = getBatchQuote;

  // ==================== 分时 API ====================

  /**
   * 获取分时数据（支持多日）
   */
  trend = getTrend;

  /**
   * 获取当日分时
   */
  intradayTrend = getIntradayTrend;

  /**
   * 获取 5 日分时
   */
  fiveDayTrend = get5DayTrend;

  /**
   * 批量获取分时
   */
  batchTrend = getBatchTrend;

  // ==================== 股票列表 API ====================

  /**
   * 获取股票列表
   */
  stockList = getStockList;

  /**
   * 获取沪深 A 股列表
   */
  aShareList = getAShareList;

  /**
   * 获取 ETF 列表
   */
  etfList = getETFList;

  /**
   * 获取创业板列表
   */
  chiNextList = getChiNextList;

  /**
   * 获取科创板列表
   */
  starList = getStarList;

  /**
   * 获取涨幅榜
   */
  topGainers = getTopGainers;

  /**
   * 获取跌幅榜
   */
  topLosers = getTopLosers;

  /**
   * 获取成交额榜
   */
  topVolume = getTopVolume;

  /**
   * 获取换手率榜
   */
  topTurnover = getTopTurnover;

  // ==================== 板块代码常量 ====================

  /**
   * 板块代码
   */
  SECTOR_CODE = SECTOR_CODE;

  // ==================== 工具方法 ====================

  /**
   * 工具方法集合
   */
  utils = {
    /**
     * 根据股票代码构建 secid
     * @example buildSecid('600519') => '1.600519'
     */
    buildSecid,

    /**
     * 自动检测市场类型
     */
    detectMarket,

    /**
     * 解析 secid
     */
    parseSecid,

    /**
     * 转换为 StockInfo 格式
     */
    toStockInfo,

    /**
     * 计算分时均价
     */
    calculateAveragePrice,

    /**
     * 获取分时高低价
     */
    getTrendHighLow
  };

  /**
   * 快捷方法：通过股票代码获取数据（自动识别市场）
   * 
   * @param code - 股票代码（如 600519、000001）
   * @returns 常用数据的快捷访问对象
   */
  stock(code: string) {
    const secid = buildSecid(code);

    return {
      /**
       * 获取日线 K 线
       */
      daily: (limit: number = 1000) => getDailyKLine(secid, limit),

      /**
       * 获取周线 K 线
       */
      weekly: (limit: number = 500) => getWeeklyKLine(secid, limit),

      /**
       * 获取月线 K 线
       */
      monthly: (limit: number = 200) => getMonthlyKLine(secid, limit),

      /**
       * 获取分钟线
       */
      minute: (period: 1 | 5 | 15 | 30 | 60 = 5, limit: number = 500) =>
        getMinuteKLine(secid, period, limit),

      /**
       * 获取实时行情
       */
      quote: () => getQuoteBySecid(secid),

      /**
       * 获取当日分时
       */
      trend: () => getIntradayTrend(secid),

      /**
       * 获取 5 日分时
       */
      trend5: () => get5DayTrend(secid),

      /**
       * 获取完整 K 线数据
       */
      kline: (options: Omit<KLineOptions, 'secid'> = {}) =>
        getKLine({ secid, ...options })
    };
  }
}

/**
 * 默认客户端实例
 */
export const eastmoney = new EastmoneyClient();
