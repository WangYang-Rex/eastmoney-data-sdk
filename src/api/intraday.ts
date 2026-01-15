/**
 * Eastmoney Data SDK - 分时线 API
 * 
 * 获取股票分时图数据（当日分时、多日分时）
 */

import { http, withRetry } from '../utils/request';
import { throttle } from '../utils/throttle';
import { parseTrends } from '../utils/parser';
import { EASTMONEY_BASE } from '../config';
import { TrendData, TrendOptions, TrendResult, TrendApiResponse } from '../types/quote';

/**
 * 获取分时线数据
 * 
 * @param options - 分时请求选项
 * @returns 分时数据结果
 * 
 * @example
 * ```ts
 * // 获取当日分时
 * const trend = await getTrend({ secid: '1.600519' });
 * console.log(trend.data);  // 分时数据数组
 * 
 * // 获取 5 日分时
 * const trend5 = await getTrend({ secid: '1.600519', ndays: 5 });
 * ```
 */
export async function getTrend(options: TrendOptions): Promise<TrendResult | null> {
  const { secid, ndays = 1 } = options;

  // 执行限流
  await throttle();

  // 构建请求参数
  const params = {
    secid,
    ndays,
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    iscr: 0,
    iscca: 0,
    _: Date.now()
  };

  // 根据 ndays 选择 API 端点
  // ndays = 1: 使用实时端点（push2）获取当日分时
  // ndays > 1: 使用历史端点（push2his）获取多日分时
  const apiUrl = ndays > 1 ? EASTMONEY_BASE.TRENDS_HISTORY : EASTMONEY_BASE.TRENDS;

  try {
    const res = await withRetry(
      () => http.get<{ data: TrendApiResponse }>(apiUrl, { params }),
      2,
      500
    );

    const data = res.data?.data;

    if (!data) {
      console.warn(`[Eastmoney SDK] No trend data for secid: ${secid}`);
      return null;
    }

    // 解析昨收价（实时端点返回原值，历史端点可能需要调整）
    const preClose = Number(data.preClose) || 0;

    return {
      code: data.code,
      name: data.name,
      preClose,
      data: parseTrends(data.trends || [], preClose)
    };
  } catch (error) {
    console.error(`[Eastmoney SDK] Failed to get trend for ${secid}:`, error);
    throw error;
  }
}

/**
 * 获取当日分时数据
 * 
 * @param secid - 证券 ID
 * @returns 分时数据
 */
export async function getIntradayTrend(secid: string): Promise<TrendData[]> {
  const result = await getTrend({ secid, ndays: 1 });
  return result?.data || [];
}

/**
 * 获取 5 日分时数据
 * 
 * @param secid - 证券 ID
 * @returns 分时数据
 */
export async function get5DayTrend(secid: string): Promise<TrendData[]> {
  const result = await getTrend({ secid, ndays: 5 });
  return result?.data || [];
}

/**
 * 批量获取多只股票的分时数据
 * 
 * @param secids - 证券 ID 数组
 * @param ndays - 天数
 * @returns 分时数据映射
 */
export async function getBatchTrend(
  secids: string[],
  ndays: number = 1
): Promise<Map<string, TrendResult | null>> {
  const result = new Map<string, TrendResult | null>();

  for (const secid of secids) {
    try {
      const trend = await getTrend({ secid, ndays });
      result.set(secid, trend);
    } catch (error) {
      console.error(`[Eastmoney SDK] Failed to get trend for ${secid}`);
      result.set(secid, null);
    }
  }

  return result;
}

/**
 * 计算分时均价
 * 
 * @param trends - 分时数据数组
 * @returns 均价
 */
export function calculateAveragePrice(trends: TrendData[]): number {
  if (!trends || trends.length === 0) {
    return 0;
  }

  const totalAmount = trends.reduce((sum, t) => sum + t.amount, 0);
  const totalVolume = trends.reduce((sum, t) => sum + t.volume, 0);

  if (totalVolume === 0) {
    return 0;
  }

  return totalAmount / totalVolume;
}

/**
 * 获取分时数据的最高/最低价
 * 
 * @param trends - 分时数据数组
 * @returns 最高价和最低价
 */
export function getTrendHighLow(trends: TrendData[]): { high: number; low: number } {
  if (!trends || trends.length === 0) {
    return { high: 0, low: 0 };
  }

  let high = trends[0].price;
  let low = trends[0].price;

  for (const t of trends) {
    if (t.price > high) high = t.price;
    if (t.price < low) low = t.price;
  }

  return { high, low };
}
