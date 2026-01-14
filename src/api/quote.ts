/**
 * Eastmoney Data SDK - 实时行情 API
 * 
 * 获取股票实时行情数据
 */

import { http, withRetry } from '../utils/request';
import { throttle } from '../utils/throttle';
import { parseQuote } from '../utils/parser';
import { EASTMONEY_BASE } from '../config';
import { Quote, QuoteOptions } from '../types/quote';

/**
 * 获取实时行情数据
 * 
 * @param options - 行情请求选项
 * @returns 行情数据
 * 
 * @example
 * ```ts
 * const quote = await getQuote({ secid: '1.600519' });
 * console.log(quote.price);  // 最新价
 * console.log(quote.pct);    // 涨跌幅
 * ```
 */
export async function getQuote(options: QuoteOptions): Promise<Quote | null> {
  const { secid } = options;

  // 执行限流
  await throttle();

  // 构建请求参数
  // 字段说明：
  // f43: 最新价, f44: 最高, f45: 最低, f46: 开盘
  // f47: 成交量, f48: 成交额, f57: 代码, f58: 名称
  // f60: 昨收, f168: 换手率, f169: 涨跌额, f170: 涨跌幅
  // f116: 总市值, f117: 流通市值, f162: 市盈率, f167: 市净率
  const params = {
    secid,
    fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f86,f116,f117,f162,f167,f168,f169,f170',
    invt: 2,
    fltt: 2,
    _: Date.now()
  };

  try {
    const res = await withRetry(
      () => http.get(EASTMONEY_BASE.QUOTE, { params }),
      2,
      500
    );

    const data = res.data?.data;

    if (!data) {
      console.warn(`[Eastmoney SDK] No quote data for secid: ${secid}`);
      return null;
    }

    return parseQuote(data);
  } catch (error) {
    console.error(`[Eastmoney SDK] Failed to get quote for ${secid}:`, error);
    throw error;
  }
}

/**
 * 获取实时行情（简化版，直接传 secid 字符串）
 * 
 * @param secid - 证券 ID
 * @returns 行情数据
 */
export async function getQuoteBySecid(secid: string): Promise<Quote | null> {
  return getQuote({ secid });
}

/**
 * 批量获取多只股票的实时行情
 * 
 * @param secids - 证券 ID 数组
 * @returns 股票行情映射
 */
export async function getBatchQuote(secids: string[]): Promise<Map<string, Quote | null>> {
  const result = new Map<string, Quote | null>();

  for (const secid of secids) {
    try {
      const quote = await getQuote({ secid });
      result.set(secid, quote);
    } catch (error) {
      console.error(`[Eastmoney SDK] Failed to get quote for ${secid}`);
      result.set(secid, null);
    }
  }

  return result;
}

/**
 * 获取实时行情的核心数据（价格相关）
 * 
 * @param secid - 证券 ID
 * @returns 核心行情数据
 */
export async function getQuoteCore(secid: string): Promise<{
  price: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  amount: number;
  pct: number;
} | null> {
  await throttle();

  const params = {
    secid,
    fields: 'f43,f44,f45,f46,f47,f48,f170',
    invt: 2,
    fltt: 2,
    _: Date.now()
  };

  try {
    const res = await http.get(EASTMONEY_BASE.QUOTE, { params });
    const data = res.data?.data;

    if (!data) {
      return null;
    }

    return {
      price: Number(data.f43) || 0,
      high: Number(data.f44) || 0,
      low: Number(data.f45) || 0,
      open: Number(data.f46) || 0,
      volume: Number(data.f47) || 0,
      amount: Number(data.f48) || 0,
      pct: Number(data.f170) || 0
    };
  } catch (error) {
    console.error(`[Eastmoney SDK] Failed to get quote core for ${secid}:`, error);
    return null;
  }
}
