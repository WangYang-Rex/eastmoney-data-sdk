/**
 * 测试分时线 API 修复
 */

import { getTrend } from '../src/api/intraday';

async function testTrend() {
  console.log('🧪 测试分时线 API 修复\n');

  // 测试当日分时
  console.log('📊 测试当日分时 (ndays=1)...');
  const trend1 = await getTrend({ secid: '1.600519', ndays: 1 });
  if (trend1) {
    console.log(`  股票: ${trend1.name} (${trend1.code})`);
    console.log(`  昨收: ${trend1.preClose}`);
    console.log(`  数据点数: ${trend1.data.length}`);
    console.log(`  第一条: ${trend1.data[0]?.datetime} (time: ${trend1.data[0]?.time})`);
    console.log(`  最后一条: ${trend1.data[trend1.data.length - 1]?.datetime}`);
  }
  console.log();

  // 测试 5 日分时
  console.log('📊 测试 5 日分时 (ndays=5)...');
  const trend5 = await getTrend({ secid: '1.600519', ndays: 5 });
  if (trend5) {
    console.log(`  股票: ${trend5.name} (${trend5.code})`);
    console.log(`  昨收: ${trend5.preClose}`);
    console.log(`  数据点数: ${trend5.data.length}`);
    console.log(`  第一条: ${trend5.data[0]?.datetime}`);
    console.log(`  最后一条: ${trend5.data[trend5.data.length - 1]?.datetime}`);

    // 统计不同日期
    const dates = new Set(trend5.data.map(d => d.datetime.split(' ')[0]));
    console.log(`  包含日期: ${Array.from(dates).join(', ')}`);
    console.log(`  共 ${dates.size} 天数据`);
  }
  console.log();

  console.log('✅ 测试完成！');
}

testTrend().catch(console.error);
