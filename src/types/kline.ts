/**
 * Eastmoney Data SDK - K 线类型定义
 */

import { FQType, KLinePeriod } from './common';

/**
 * K 线数据结构
 */
export interface KLine {
  /** 日期/时间（如 2024-01-15 或 2024-01-15 09:30） */
  date: string;
  /** 开盘价 */
  open: number;
  /** 收盘价 */
  close: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 成交量（股） */
  volume: number;
  /** 成交额（元） */
  amount: number;
  /** 振幅（%） */
  amplitude: number;
  /** 涨跌幅（%） */
  pct: number;
  /** 涨跌额 */
  change: number;
  /** 换手率（%） */
  turnover: number;
}

/**
 * K 线请求选项
 */
export interface KLineOptions {
  /** 
   * 证券 ID
   * 格式：市场代码.股票代码
   * - 上海：1.600519（贵州茅台）
   * - 深圳：0.000001（平安银行）
   * - 科创板/创业板同理
   */
  secid: string;

  /**
   * K 线周期
   * - 1=1分钟, 5=5分钟, 15=15分钟, 30=30分钟, 60=60分钟
   * - 101=日线, 102=周线, 103=月线
   * @default 101
   */
  klt?: KLinePeriod;

  /**
   * 复权类型
   * - 0=不复权, 1=前复权, 2=后复权
   * @default 1
   */
  fqt?: FQType;

  /**
   * 返回数据条数限制
   * @default 1000
   */
  limit?: number;

  /**
   * 开始日期（格式：YYYYMMDD）
   * 如果不传，则从最早数据开始
   */
  startDate?: string;

  /**
   * 结束日期（格式：YYYYMMDD）
   * 如果不传，则到最新数据
   */
  endDate?: string;
}

/**
 * K 线 API 原始响应数据
 */
export interface KLineApiResponse {
  /** 股票代码 */
  code: string;
  /** 市场代码 */
  market: number;
  /** 股票名称 */
  name: string;
  /** 小数位数 */
  decimal: number;
  /** 价格因子 */
  dktotal: number;
  /** 前收盘价 */
  preKPrice: number;
  /** K 线数据数组（原始字符串格式） */
  klines: string[];
}
