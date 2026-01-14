/**
 * Eastmoney Data SDK - HTTP 请求封装
 * 
 * 基于 axios 的统一请求模块
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DEFAULT_HEADERS, DEFAULT_TIMEOUT } from '../config';

/**
 * 创建默认的 HTTP 客户端实例
 */
export const http: AxiosInstance = axios.create({
  timeout: DEFAULT_TIMEOUT,
  headers: DEFAULT_HEADERS
});

/**
 * 请求拦截器 - 添加日志
 */
http.interceptors.request.use(
  (config) => {
    // 可在此添加请求日志
    // console.log(`[Eastmoney SDK] Request: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一错误处理
 */
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      console.error(`[Eastmoney SDK] HTTP Error: ${error.response.status}`);
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('[Eastmoney SDK] Network Error: No response received');
    } else {
      // 请求配置出错
      console.error(`[Eastmoney SDK] Request Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

/**
 * 创建自定义 HTTP 客户端
 * 
 * @param config - axios 配置选项
 * @returns AxiosInstance
 */
export function createHttpClient(config: AxiosRequestConfig = {}): AxiosInstance {
  const client = axios.create({
    timeout: config.timeout || DEFAULT_TIMEOUT,
    headers: {
      ...DEFAULT_HEADERS,
      ...config.headers
    },
    ...config
  });

  return client;
}

/**
 * 带重试的请求函数
 * 
 * @param fn - 请求函数
 * @param retries - 重试次数
 * @param delay - 重试延迟（毫秒）
 * @returns 请求结果
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 如果还有重试机会，等待后重试
      if (i < retries) {
        console.warn(`[Eastmoney SDK] Request failed, retrying (${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}
