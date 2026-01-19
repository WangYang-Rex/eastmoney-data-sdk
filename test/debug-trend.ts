import { http, withRetry } from '../src/utils/request';
import { EASTMONEY_BASE } from '../src/config';
import { buildSecid } from '../src';

/**
 * 调试脚本：查看分时数据的原始 API 响应
 */

async function debugTrendData() {
  console.log('🔍 调试分时数据 API 响应\n');

  const code = '588080';
  const secid = buildSecid(code);

  // 构建请求参数
  const params = {
    secid,
    ndays: 1,
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    iscr: 0,
    iscca: 0,
    _: Date.now()
  };

  try {
    console.log('📡 请求参数:', params);
    console.log('📡 API URL:', EASTMONEY_BASE.TRENDS);
    console.log();

    const res = await withRetry(
      () => http.get<{ data: any }>(EASTMONEY_BASE.TRENDS, { params }),
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
      console.log('📊 原始分时数据示例（前 5 条）:');
      data.trends.slice(0, 5).forEach((trend: string, index: number) => {
        console.log(`  [${index}] ${trend}`);
        
        // 解析并显示字段
        const parts = trend.split(',');
        console.log(`      字段数量: ${parts.length}`);
        console.log(`      [0] datetime: ${parts[0]}`);
        console.log(`      [1] price: ${parts[1]}`);
        console.log(`      [2] avgPrice: ${parts[2]}`);
        console.log(`      [3] volume: ${parts[3]}`);
        console.log(`      [4] amount: ${parts[4]}`);
        if (parts.length > 5) {
          console.log(`      [5] 其他: ${parts[5]}`);
        }
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

debugTrendData().catch(console.error);
