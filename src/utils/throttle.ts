/**
 * Eastmoney Data SDK - 限流工具
 * 
 * 用于控制 API 请求频率，避免触发反爬机制
 */

import { DEFAULT_THROTTLE_MS } from '../config';

/** 上次请求时间戳 */
let lastRequestTime = 0;

/**
 * 限流函数
 * 确保两次请求之间至少间隔指定时间
 * 
 * @param ms - 最小间隔时间（毫秒），默认 300ms
 * @returns Promise<void>
 * 
 * @example
 * ```ts
 * await throttle(500);  // 等待至少 500ms
 * await fetchData();
 * ```
 */
export async function throttle(ms: number = DEFAULT_THROTTLE_MS): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  // 如果距离上次请求时间不足，则等待
  if (timeSinceLastRequest < ms) {
    const waitTime = ms - timeSinceLastRequest;
    await new Promise<void>(resolve => setTimeout(resolve, waitTime));
  }

  // 更新上次请求时间
  lastRequestTime = Date.now();
}

/**
 * 重置限流计时器
 * 主要用于测试场景
 */
export function resetThrottle(): void {
  lastRequestTime = 0;
}

/**
 * 创建独立的限流器实例
 * 用于需要独立限流控制的场景
 * 
 * @param defaultMs - 默认间隔时间
 * @returns 限流器对象
 */
export function createThrottler(defaultMs: number = DEFAULT_THROTTLE_MS) {
  let lastTime = 0;

  return {
    /**
     * 执行限流
     */
    async throttle(ms: number = defaultMs): Promise<void> {
      const now = Date.now();
      const diff = now - lastTime;

      if (diff < ms) {
        await new Promise<void>(r => setTimeout(r, ms - diff));
      }

      lastTime = Date.now();
    },

    /**
     * 重置计时器
     */
    reset(): void {
      lastTime = 0;
    }
  };
}
