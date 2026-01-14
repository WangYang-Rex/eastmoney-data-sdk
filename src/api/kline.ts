/**
 * Eastmoney Data SDK - K 线 API
 * 
 * 获取股票历史 K 线数据（日线、周线、月线、分钟线）
 */

import { http, withRetry } from '../utils/request';
import { throttle } from '../utils/throttle';
import { parseKLines } from '../utils/parser';
import { EASTMONEY_BASE } from '../config';
import { KLine, KLineOptions, KLineApiResponse } from '../types/kline';

/**
 * 获取 K 线数据
 * 
 * @param options - K 线请求选项
 * @returns K 线数据数组
 * 
 * @example
 * ```ts
 * // 获取贵州茅台日线数据（前复权）
 * const klines = await getKLine({
 *   secid: '1.600519',
 *   klt: 101,
 *   fqt: 1,
 *   limit: 500
 * });
 * 
 * // 获取 5 分钟 K 线
 * const min5Klines = await getKLine({
 *   secid: '0.000001',
 *   klt: 5,
 *   limit: 100
 * });
 * ```
 */
export async function getKLine(options: KLineOptions): Promise<KLine[]> {
  const {
    secid,
    klt = 101,      // 默认日线
    fqt = 1,        // 默认前复权
    limit = 1000,   // 默认 1000 条
    startDate,
    endDate
  } = options;

  // 执行限流
  await throttle();

  // 构建请求参数
  const params: Record<string, string | number> = {
    secid,
    klt,
    fqt,
    lmt: limit,
    // end 参数是必须的，默认设置为较远的未来日期
    end: endDate || '20500101',
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
    _: Date.now()
  };

  // 添加开始日期参数
  if (startDate) {
    params.beg = startDate;
  }

  try {
    const res = await withRetry(
      () => http.get<{ data: KLineApiResponse }>(EASTMONEY_BASE.KLINE, { params }),
      2,  // 重试 2 次
      500 // 延迟 500ms
    );

    const data = res.data?.data;

    if (!data || !data.klines) {
      console.warn(`[Eastmoney SDK] No kline data for secid: ${secid}`);
      return [];
    }

    return parseKLines(data.klines);
  } catch (error) {
    console.error(`[Eastmoney SDK] Failed to get kline for ${secid}:`, error);
    throw error;
  }
}

/**
 * 获取日线数据（简化版）
 * 
 * @param secid - 证券 ID
 * @param limit - 数据条数
 * @param fqt - 复权类型（默认前复权）
 * @returns K 线数据数组
 */
export async function getDailyKLine(
  secid: string,
  limit: number = 1000,
  fqt: 0 | 1 | 2 = 1
): Promise<KLine[]> {
  return getKLine({ secid, klt: 101, fqt, limit });
}

/**
 * 获取周线数据
 * 
 * @param secid - 证券 ID
 * @param limit - 数据条数
 * @param fqt - 复权类型
 * @returns K 线数据数组
 */
export async function getWeeklyKLine(
  secid: string,
  limit: number = 500,
  fqt: 0 | 1 | 2 = 1
): Promise<KLine[]> {
  return getKLine({ secid, klt: 102, fqt, limit });
}

/**
 * 获取月线数据
 * 
 * @param secid - 证券 ID
 * @param limit - 数据条数
 * @param fqt - 复权类型
 * @returns K 线数据数组
 */
export async function getMonthlyKLine(
  secid: string,
  limit: number = 200,
  fqt: 0 | 1 | 2 = 1
): Promise<KLine[]> {
  return getKLine({ secid, klt: 103, fqt, limit });
}

/**
 * 获取分钟线数据
 * 
 * @param secid - 证券 ID
 * @param period - 分钟周期（1/5/15/30/60）
 * @param limit - 数据条数
 * @returns K 线数据数组
 */
export async function getMinuteKLine(
  secid: string,
  period: 1 | 5 | 15 | 30 | 60 = 5,
  limit: number = 500
): Promise<KLine[]> {
  return getKLine({ secid, klt: period, fqt: 0, limit });
}

/**
 * 批量获取多只股票的 K 线数据
 * 
 * @param secids - 证券 ID 数组
 * @param options - K 线请求选项（不含 secid）
 * @returns 股票 K 线数据映射
 */
export async function getBatchKLine(
  secids: string[],
  options: Omit<KLineOptions, 'secid'> = {}
): Promise<Map<string, KLine[]>> {
  const result = new Map<string, KLine[]>();

  for (const secid of secids) {
    try {
      const klines = await getKLine({ secid, ...options });
      result.set(secid, klines);
    } catch (error) {
      console.error(`[Eastmoney SDK] Failed to get kline for ${secid}`);
      result.set(secid, []);
    }
  }

  return result;
}
