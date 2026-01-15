/**
 * Eastmoney Data SDK - 行情类型定义
 */

/**
 * 实时行情数据结构
 */
export interface Quote {
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 最新价 */
  price: number;
  /** 今日最高价 */
  high: number;
  /** 今日最低价 */
  low: number;
  /** 今日开盘价 */
  open: number;
  /** 昨日收盘价 */
  preClose: number;
  /** 成交量（股） */
  volume: number;
  /** 成交额（元） */
  amount: number;
  /** 涨跌幅（%） */
  pct: number;
  /** 涨跌额 */
  change: number;
  /** 换手率（%） */
  turnover: number;
  /** 总市值 */
  totalMarketCap: number;
  /** 流通市值 */
  floatMarketCap: number;
  /** 市盈率（动态） */
  pe: number;
  /** 市净率 */
  pb: number;
  /** 更新时间戳 */
  updateTime: string;
}

/**
 * 实时行情请求选项
 */
export interface QuoteOptions {
  /** 
   * 证券 ID
   * 格式：市场代码.股票代码
   */
  secid: string;
}

/**
 * 分时线数据结构
 */
export interface TrendData {
  /** 完整日期时间（YYYY-MM-DD HH:mm 格式） */
  datetime: string;
  /** 时间（HH:mm 格式，兼容旧版） */
  time: string;
  /** 当前价格 */
  price: number;
  /** 均价 */
  avgPrice: number;
  /** 成交量（股） */
  volume: number;
  /** 成交额（元） */
  amount: number;
  /** 涨跌幅（%） */
  pct: number;
}

/**
 * 分时线请求选项
 */
export interface TrendOptions {
  /** 
   * 证券 ID
   * 格式：市场代码.股票代码
   */
  secid: string;

  /**
   * 天数
   * - 1: 当日分时
   * - 5: 5日分时
   * @default 1
   */
  ndays?: number;
}

/**
 * 分时线 API 原始响应
 */
export interface TrendApiResponse {
  /** 股票代码 */
  code: string;
  /** 市场代码 */
  market: number;
  /** 股票名称 */
  name: string;
  /** 昨收价 */
  preClose: number;
  /** 分时数据列表 */
  trends: string[];
}

/**
 * 分时完整数据
 */
export interface TrendResult {
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 昨收价 */
  preClose: number;
  /** 分时数据列表 */
  data: TrendData[];
}
