import { http, withRetry } from '../src/utils/request';
import { EASTMONEY_BASE } from '../src/config';
import { buildSecid } from '../src';

/**
 * 调试脚本：查看 5 日分时数据的原始 API 响应
 */

async function debug5DayTrendData() {
  console.log('🔍 调试 5 日分时数据 API 响应\n');

  const code = '588080';
  const secid = buildSecid(code);

  // 构建请求参数
  const params = {
    secid,
    ndays: 5,  // 5 日分时
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    iscr: 0,
    iscca: 0,
    _: Date.now()
  };

  try {
    console.log('📡 请求参数:', params);
    console.log('📡 API URL:', EASTMONEY_BASE.TRENDS_HISTORY);
    console.log();

    const res = await withRetry(
      () => http.get<{ data: any }>(EASTMONEY_BASE.TRENDS_HISTORY, { params }),
      2,
      500
    );

    const data = res.data?.data;

    if (!data) {
      console.error('❌ 未获取到数据');
      return;
    }

    console.log('✅ API 响应数据结构:');
    console.log('  - code:', data.code);
    console.log('  - name:', data.name);
    console.log('  - market:', data.market);
    console.log('  - preClose:', data.preClose);
    console.log('  - trends 数组长度:', data.trends?.length || 0);
    console.log();

    if (data.trends && data.trends.length > 0) {
      console.log('📊 原始 5 日分时数据示例:');
      console.log('\n--- 第 1 天开始的数据（前 5 条）---');
      data.trends.slice(0, 5).forEach((trend: string, index: number) => {
        console.log(`  [${index}] ${trend}`);
        
        // 解析并显示字段
        const parts = trend.split(',');
        console.log(`      字段数量: ${parts.length}`);
        parts.forEach((part, i) => {
          console.log(`      [${i}] ${part}`);
        });
        console.log();
      });

      console.log('\n--- 第 2 天开始的数据（约第 241-245 条）---');
      const day2Start = 241;
      if (data.trends.length > day2Start) {
        data.trends.slice(day2Start, day2Start + 5).forEach((trend: string, index: number) => {
          console.log(`  [${day2Start + index}] ${trend}`);
          
          const parts = trend.split(',');
          console.log(`      字段数量: ${parts.length}`);
          parts.forEach((part, i) => {
            console.log(`      [${i}] ${part}`);
          });
          console.log();
        });
      }

      console.log('\n--- 最后 3 条数据 ---');
      const lastIndex = data.trends.length - 3;
      data.trends.slice(lastIndex).forEach((trend: string, index: number) => {
        console.log(`  [${lastIndex + index}] ${trend}`);
        
        const parts = trend.split(',');
        console.log(`      字段数量: ${parts.length}`);
        parts.forEach((part, i) => {
          console.log(`      [${i}] ${part}`);
        });
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

debug5DayTrendData().catch(console.error);
