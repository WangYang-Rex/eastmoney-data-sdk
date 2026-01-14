/**
 * Eastmoney Data SDK - 股票列表 API
 * 
 * 获取 A 股、ETF 等股票列表
 */

import { http, withRetry } from '../utils/request';
import { throttle } from '../utils/throttle';
import { EASTMONEY_BASE } from '../config';
import { StockInfo } from '../types/common';

/**
 * 股票列表项
 */
export interface StockListItem {
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 市场代码 */
  market: number;
  /** 最新价 */
  price: number;
  /** 涨跌幅 */
  pct: number;
  /** 涨跌额 */
  change: number;
  /** 成交量 */
  volume: number;
  /** 成交额 */
  amount: number;
  /** 总市值 */
  totalMarketCap: number;
  /** 流通市值 */
  floatMarketCap: number;
  /** 换手率 */
  turnover: number;
}

/**
 * 股票列表请求选项
 */
export interface StockListOptions {
  /** 板块类型（用于 API 参数 fs） */
  fs?: string;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向（asc/desc） */
  sortOrder?: 'asc' | 'desc';
  /** 每页数量 */
  pageSize?: number;
  /** 页码（从 1 开始） */
  page?: number;
}

// ==================== 板块代码常量 ====================

/**
 * 板块代码
 */
export const SECTOR_CODE = {
  /** 沪深 A 股 */
  A_SHARE: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
  /** 上证 A 股 */
  SH_A: 'm:1+t:2,m:1+t:23',
  /** 深证 A 股 */
  SZ_A: 'm:0+t:6,m:0+t:80',
  /** 创业板 */
  CHINEXT: 'm:0+t:80',
  /** 科创板 */
  STAR: 'm:1+t:23',
  /** ETF 基金 */
  ETF: 'b:MK0021,b:MK0022,b:MK0023,b:MK0024',
  /** 上证 ETF */
  SH_ETF: 'b:MK0021',
  /** 深证 ETF */
  SZ_ETF: 'b:MK0022',
  /** 北交所 */
  BJ: 'm:0+t:81+s:2048'
} as const;

/**
 * 获取股票列表
 * 
 * @param options - 请求选项
 * @returns 股票列表
 * 
 * @example
 * ```ts
 * // 获取沪深 A 股列表
 * const stocks = await getStockList({ fs: SECTOR_CODE.A_SHARE });
 * 
 * // 获取涨幅前 100
 * const top100 = await getStockList({
 *   fs: SECTOR_CODE.A_SHARE,
 *   sortField: 'f3',
 *   sortOrder: 'desc',
 *   pageSize: 100
 * });
 * ```
 */
export async function getStockList(options: StockListOptions = {}): Promise<StockListItem[]> {
  const {
    fs = SECTOR_CODE.A_SHARE,
    sortField = 'f3',   // 默认按涨跌幅排序
    sortOrder = 'desc',
    pageSize = 50,
    page = 1
  } = options;

  await throttle();

  // 构建请求参数
  // 字段说明：
  // f2: 最新价, f3: 涨跌幅, f4: 涨跌额
  // f5: 成交量, f6: 成交额, f7: 振幅
  // f8: 换手率, f9: 市盈率, f10: 量比
  // f12: 代码, f14: 名称, f20: 总市值, f21: 流通市值
  const params = {
    pn: page,
    pz: pageSize,
    po: sortOrder === 'desc' ? 1 : 0,
    np: 1,
    fltt: 2,
    invt: 2,
    fid: sortField,
    fs,
    fields: 'f2,f3,f4,f5,f6,f7,f8,f12,f13,f14,f20,f21',
    _: Date.now()
  };

  try {
    const res = await withRetry(
      () => http.get(EASTMONEY_BASE.STOCK_LIST, { params }),
      2,
      500
    );

    const data = res.data?.data;

    if (!data || !data.diff) {
      console.warn('[Eastmoney SDK] No stock list data');
      return [];
    }

    // 解析股票列表（fltt=2 时已格式化，无需除 100）
    return data.diff.map((item: Record<string, unknown>) => ({
      code: String(item.f12 || ''),
      name: String(item.f14 || ''),
      market: Number(item.f13) || 0,
      price: Number(item.f2) || 0,
      pct: Number(item.f3) || 0,
      change: Number(item.f4) || 0,
      volume: Number(item.f5) || 0,
      amount: Number(item.f6) || 0,
      totalMarketCap: Number(item.f20) || 0,
      floatMarketCap: Number(item.f21) || 0,
      turnover: Number(item.f8) || 0
    }));
  } catch (error) {
    console.error('[Eastmoney SDK] Failed to get stock list:', error);
    throw error;
  }
}

/**
 * 获取沪深 A 股列表
 * 
 * @param pageSize - 每页数量
 * @param page - 页码
 * @returns 股票列表
 */
export async function getAShareList(pageSize: number = 50, page: number = 1): Promise<StockListItem[]> {
  return getStockList({ fs: SECTOR_CODE.A_SHARE, pageSize, page });
}

/**
 * 获取 ETF 列表
 * 
 * @param pageSize - 每页数量
 * @param page - 页码
 * @returns ETF 列表
 */
export async function getETFList(pageSize: number = 50, page: number = 1): Promise<StockListItem[]> {
  return getStockList({ fs: SECTOR_CODE.ETF, pageSize, page });
}

/**
 * 获取创业板列表
 * 
 * @param pageSize - 每页数量
 * @param page - 页码
 * @returns 股票列表
 */
export async function getChiNextList(pageSize: number = 50, page: number = 1): Promise<StockListItem[]> {
  return getStockList({ fs: SECTOR_CODE.CHINEXT, pageSize, page });
}

/**
 * 获取科创板列表
 * 
 * @param pageSize - 每页数量
 * @param page - 页码
 * @returns 股票列表
 */
export async function getStarList(pageSize: number = 50, page: number = 1): Promise<StockListItem[]> {
  return getStockList({ fs: SECTOR_CODE.STAR, pageSize, page });
}

/**
 * 获取涨幅榜
 * 
 * @param limit - 获取数量
 * @param fs - 板块代码
 * @returns 涨幅榜列表
 */
export async function getTopGainers(limit: number = 20, fs: string = SECTOR_CODE.A_SHARE): Promise<StockListItem[]> {
  return getStockList({
    fs,
    sortField: 'f3',
    sortOrder: 'desc',
    pageSize: limit
  });
}

/**
 * 获取跌幅榜
 * 
 * @param limit - 获取数量
 * @param fs - 板块代码
 * @returns 跌幅榜列表
 */
export async function getTopLosers(limit: number = 20, fs: string = SECTOR_CODE.A_SHARE): Promise<StockListItem[]> {
  return getStockList({
    fs,
    sortField: 'f3',
    sortOrder: 'asc',
    pageSize: limit
  });
}

/**
 * 获取成交额榜
 * 
 * @param limit - 获取数量
 * @param fs - 板块代码
 * @returns 成交额榜列表
 */
export async function getTopVolume(limit: number = 20, fs: string = SECTOR_CODE.A_SHARE): Promise<StockListItem[]> {
  return getStockList({
    fs,
    sortField: 'f6',
    sortOrder: 'desc',
    pageSize: limit
  });
}

/**
 * 获取换手率榜
 * 
 * @param limit - 获取数量
 * @param fs - 板块代码
 * @returns 换手率榜列表
 */
export async function getTopTurnover(limit: number = 20, fs: string = SECTOR_CODE.A_SHARE): Promise<StockListItem[]> {
  return getStockList({
    fs,
    sortField: 'f8',
    sortOrder: 'desc',
    pageSize: limit
  });
}

/**
 * 将股票列表项转换为 StockInfo 格式
 * 
 * @param item - 股票列表项
 * @returns StockInfo
 */
export function toStockInfo(item: StockListItem): StockInfo {
  return {
    code: item.code,
    name: item.name,
    market: item.market === 1 ? 'SH' : 'SZ',
    secid: `${item.market}.${item.code}`
  };
}
