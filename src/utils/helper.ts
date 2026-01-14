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
  const prefix = code.substring(0, 3);
  const firstDigit = code.charAt(0);

  // 上海证券交易所
  // 60x: 主板
  // 688: 科创板
  // 900: B股
  if (prefix.startsWith('60') || prefix.startsWith('68') || prefix.startsWith('9')) {
    return 'SH';
  }

  // 北京证券交易所
  // 8: 北交所
  // 43: 新三板
  if (firstDigit === '8' || prefix.startsWith('43')) {
    return 'BJ';
  }

  // 深圳证券交易所
  // 00x: 主板
  // 30x: 创业板
  // 200: B股
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
