/**
 * Eastmoney Data SDK - 数据解析器
 * 
 * 将 API 返回的原始数据解析为结构化数据
 */

import { KLine } from '../types/kline';
import { Quote, TrendData } from '../types/quote';

/**
 * 解析 K 线数据
 * 
 * 原始格式：日期,开盘,收盘,最高,最低,成交量,成交额,振幅,涨跌幅,涨跌额,换手率
 * 示例：2024-01-15,1835.00,1851.00,1852.90,1830.00,1234567,2345678901,1.25,0.87,16.00,0.12
 * 
 * @param klines - 原始 K 线字符串数组
 * @returns 解析后的 K 线数据数组
 */
export function parseKLines(klines: string[]): KLine[] {
  if (!klines || !Array.isArray(klines)) {
    return [];
  }

  return klines.map(line => {
    const parts = line.split(',');

    // 确保数据完整性
    if (parts.length < 11) {
      console.warn(`[Eastmoney SDK] Invalid kline data: ${line}`);
      return null;
    }

    const [
      date,
      open,
      close,
      high,
      low,
      volume,
      amount,
      amplitude,
      pct,
      change,
      turnover
    ] = parts;

    return {
      date,
      open: parseFloat(open) || 0,
      close: parseFloat(close) || 0,
      high: parseFloat(high) || 0,
      low: parseFloat(low) || 0,
      volume: parseFloat(volume) || 0,
      amount: parseFloat(amount) || 0,
      amplitude: parseFloat(amplitude) || 0,
      pct: parseFloat(pct) || 0,
      change: parseFloat(change) || 0,
      turnover: parseFloat(turnover) || 0
    };
  }).filter((item): item is KLine => item !== null);
}

/**
 * 解析实时行情数据
 * 
 * @param data - API 原始数据
 * @returns 解析后的行情数据
 */
export function parseQuote(data: Record<string, unknown>): Quote | null {
  if (!data) {
    return null;
  }

  return {
    code: String(data.f57 || ''),
    name: String(data.f58 || ''),
    price: Number(data.f43) || 0,           // 最新价（fltt=2 时已格式化）
    high: Number(data.f44) || 0,            // 最高价
    low: Number(data.f45) || 0,             // 最低价
    open: Number(data.f46) || 0,            // 开盘价
    preClose: Number(data.f60) || 0,        // 昨收价
    volume: Number(data.f47) || 0,          // 成交量
    amount: Number(data.f48) || 0,          // 成交额
    pct: Number(data.f170) || 0,            // 涨跌幅
    change: Number(data.f169) || 0,         // 涨跌额
    turnover: Number(data.f168) || 0,       // 换手率
    totalMarketCap: Number(data.f116) || 0, // 总市值
    floatMarketCap: Number(data.f117) || 0, // 流通市值
    pe: Number(data.f162) || 0,             // 市盈率
    pb: Number(data.f167) || 0,             // 市净率
    updateTime: String(data.f86 || '')      // 更新时间戳
  };
}

/**
 * 解析分时线数据
 * 
 * 原始格式：时间,价格,均价,成交量,成交额,涨跌幅
 * 示例：2024-01-15 09:30,1835.00,1835.00,12345,23456789,0.00
 * 
 * @param trends - 原始分时数据字符串数组
 * @param preClose - 昨收价（用于计算涨跌幅）
 * @returns 解析后的分时数据数组
 */
export function parseTrends(trends: string[], preClose: number = 0): TrendData[] {
  if (!trends || !Array.isArray(trends)) {
    return [];
  }

  return trends.map(line => {
    const parts = line.split(',');

    if (parts.length < 3) {
      console.warn(`[Eastmoney SDK] Invalid trend data: ${line}`);
      return null;
    }

    const [datetime, price, avgPrice, volume, amount] = parts;

    // 提取时间部分（去掉日期）
    const timePart = datetime.includes(' ')
      ? datetime.split(' ')[1]
      : datetime;

    const priceNum = parseFloat(price) || 0;

    return {
      time: timePart,
      price: priceNum,
      avgPrice: parseFloat(avgPrice) || 0,
      volume: parseFloat(volume) || 0,
      amount: parseFloat(amount) || 0,
      pct: preClose ? ((priceNum - preClose) / preClose) * 100 : 0
    };
  }).filter((item): item is TrendData => item !== null);
}

/**
 * 格式化数字（保留指定小数位）
 * 
 * @param num - 数字
 * @param decimals - 小数位数
 * @returns 格式化后的数字
 */
export function formatNumber(num: number, decimals: number = 2): number {
  return Number(num.toFixed(decimals));
}

/**
 * 格式化大数字（转换为万/亿单位）
 * 
 * @param num - 数字
 * @returns 格式化后的字符串
 */
export function formatLargeNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}亿`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(2)}万`;
  }
  return num.toFixed(2);
}
