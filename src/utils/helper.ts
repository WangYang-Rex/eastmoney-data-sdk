/**
 * Eastmoney Data SDK - 辅助工具函数
 */

import { MARKET_CODE } from '../config';
import { MarketType } from '../types';

/**
 * 根据股票代码自动判断市场
 * 
 * @param code - 股票代码（如 600519、000001）
 * @returns 市场类型
 */
export function detectMarket(code: string): MarketType {
  if (!code || code.length < 5) {
    throw new Error(`Invalid stock code: ${code}`);
  }

  const prefix3 = code.slice(0, 3);
  const prefix2 = code.slice(0, 2);
  const firstDigit = code.charAt(0);

  /** ---------- 北京证券交易所 ---------- */
  // 8xxxxxx: 北交所
  // 43xxxx: 新三板
  if (firstDigit === '8' || prefix2 === '43') {
    return 'BJ';
  }

  /** ---------- 上海证券交易所 ---------- */
  // 股票
  if (
    prefix3 === '600' ||
    prefix3 === '601' ||
    prefix3 === '603' ||
    prefix3 === '605' ||
    prefix3 === '688' ||
    prefix3 === '900'
  ) {
    return 'SH';
  }

  // ETF / LOF（沪市）
  if (
    prefix3 === '510' || // ETF
    prefix3 === '511' || // 债券 ETF
    prefix3 === '512' ||
    prefix3 === '513' ||
    prefix3 === '515' ||
    prefix3 === '516' ||
    prefix3 === '518' ||
    prefix3 === '588' || // 科创 ETF
    prefix3 === '589' ||
    prefix3 === '501'    // LOF
  ) {
    return 'SH';
  }

  /** ---------- 深圳证券交易所 ---------- */
  // 股票
  if (
    prefix3 === '000' ||
    prefix3 === '001' ||
    prefix3 === '002' ||
    prefix3 === '300' ||
    prefix3 === '200'
  ) {
    return 'SZ';
  }

  // ETF / LOF（深市）
  if (
    prefix3 === '159' || // ETF
    prefix3 === '160' || // ETF / 分级基金
    prefix3 === '161' ||
    prefix3 === '162'
  ) {
    return 'SZ';
  }

  /** ---------- 默认兜底 ---------- */
  // 大部分未知代码默认深市（符合东财 & 交易所习惯）
  return 'SZ';
}


/**
 * 构建 secid（证券 ID）
 * 
 * @param code - 股票代码
 * @param market - 可选，手动指定市场
 * @returns secid（如 1.600519）
 * 
 * @example
 * ```ts
 * buildSecid('600519');        // => '1.600519'
 * buildSecid('000001');        // => '0.000001'
 * buildSecid('000001', 'SZ');  // => '0.000001'
 * ```
 */
export function buildSecid(code: string, market?: MarketType): string {
  const detectedMarket = market || detectMarket(code);
  const marketCode = MARKET_CODE[detectedMarket];
  return `${marketCode}.${code}`;
}

/**
 * 解析 secid 提取信息
 * 
 * @param secid - 证券 ID（如 1.600519）
 * @returns 解析结果
 */
export function parseSecid(secid: string): { market: MarketType; code: string } {
  const [marketCode, code] = secid.split('.');

  let market: MarketType = 'SZ';
  if (marketCode === '1') {
    market = 'SH';
  } else if (marketCode === '0') {
    market = detectMarket(code);
  }

  return { market, code };
}

/**
 * 格式化日期为 YYYYMMDD 格式
 * 
 * @param date - Date 对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 获取 N 天前的日期
 * 
 * @param days - 天数
 * @returns Date 对象
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 判断是否为交易日（简单判断，仅排除周末）
 * 
 * @param date - 日期
 * @returns 是否为交易日
 */
export function isTradingDay(date: Date = new Date()): boolean {
  const day = date.getDay();
  // 周六(6)和周日(0)不是交易日
  return day !== 0 && day !== 6;
}

/**
 * 判断当前是否为交易时间
 * 
 * @returns 是否在交易时间内
 */
export function isTradingTime(): boolean {
  const now = new Date();

  // 首先判断是否为交易日
  if (!isTradingDay(now)) {
    return false;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 100 + minutes;

  // 早盘：9:30 - 11:30
  // 午盘：13:00 - 15:00
  return (time >= 930 && time <= 1130) || (time >= 1300 && time <= 1500);
}

/**
 * 延迟函数
 * 
 * @param ms - 延迟毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 批量处理数组（分批执行）
 * 
 * @param items - 待处理数组
 * @param batchSize - 每批数量
 * @param handler - 处理函数
 * @param delayMs - 批次间延迟
 */
export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<R>,
  delayMs: number = 300
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(handler));
    results.push(...batchResults);

    // 批次间延迟
    if (i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }

  return results;
}

/**
 * 格式化 Unix 时间戳为可读字符串
 * 
 * @param timestamp - Unix 时间戳（秒级）
 * @param format - 格式类型，'datetime' 或 'date'
 * @returns 格式化后的时间字符串
 * 
 * @example
 * ```ts
 * formatTimestamp(1768810299);              // => '2026-01-19 16:11:39'
 * formatTimestamp(1768810299, 'date');      // => '2026-01-19'
 * formatTimestamp(1768810299, 'datetime');  // => '2026-01-19 16:11:39'
 * ```
 */
export function formatTimestamp(timestamp: number, format: 'datetime' | 'date' = 'datetime'): string {
  if (!timestamp || timestamp <= 0) {
    return '';
  }

  const date = new Date(timestamp * 1000); // 转换为毫秒
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (format === 'date') {
    return `${year}-${month}-${day}`;
  }
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 将 Unix 时间戳转换为 Date 对象
 * 
 * @param timestamp - Unix 时间戳（秒级）
 * @returns Date 对象
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}
