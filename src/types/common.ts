/**
 * Eastmoney Data SDK - 通用类型定义
 */

/**
 * 市场类型
 */
export type MarketType = 'SH' | 'SZ' | 'BJ';

/**
 * K 线周期类型
 */
export type KLinePeriod = 1 | 5 | 15 | 30 | 60 | 101 | 102 | 103;

/**
 * 复权类型
 * - 0: 不复权
 * - 1: 前复权
 * - 2: 后复权
 */
export type FQType = 0 | 1 | 2;

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = unknown> {
  /** 响应码 */
  rc: number;
  /** 响应消息 */
  rt: number;
  /** 响应数据 */
  data: T;
}

/**
 * 股票基础信息
 */
export interface StockInfo {
  /** 股票代码（如 600519） */
  code: string;
  /** 股票名称 */
  name: string;
  /** 市场类型 */
  market: MarketType;
  /** 完整 secid（如 1.600519） */
  secid: string;
}

/**
 * 分页选项
 */
export interface PaginationOptions {
  /** 每页数量 */
  limit?: number;
  /** 页码 */
  page?: number;
}

/**
 * SDK 配置选项
 */
export interface SDKOptions {
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 限流间隔（毫秒） */
  throttleMs?: number;
  /** 是否启用限流 */
  enableThrottle?: boolean;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}
