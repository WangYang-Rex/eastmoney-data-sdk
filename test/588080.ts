import { EastmoneyClient, buildSecid } from 'eastmoney-data-sdk';

/**
 * Eastmoney Data SDK - 测试脚本
 */

async function main() {
  console.log('🚀 开始测试 Eastmoney Data SDK\n');

  const client = new EastmoneyClient();

  const code = '588080';
  const secid = '1.588080'; // buildSecid(code);
  // 测试构建 secid
  console.log('📌 测试构建 secid:');
  console.log(`  ${code} => ${secid}`);
  // console.log(`  600519 => ${buildSecid('600519')}`);
  // console.log(`  000001 => ${buildSecid('000001')}`);
  // console.log(`  300750 => ${buildSecid('300750')}`);
  // console.log(`  688111 => ${buildSecid('688111')}`);
  console.log();

  // 测试获取实时行情
  console.log('💹 测试获取实时行情...');
  try {
    const quote = await client.quote(secid);
    if (quote) {
      console.log(`  ${quote.name}(${quote.code})`);
      console.log(`  最新价: ${quote.price}, 涨跌幅: ${quote.pct}%`);
      console.log(`  成交量: ${quote.volume}, 成交额: ${quote.amount}`);
    }
  } catch (error) {
    console.error('  获取行情失败:', error);
  }
  console.log();

  // 测试获取分时数据
  console.log('📊 测试获取5日分时数据...');
  try {
    const intradayTrend = await client.intradayTrend(secid);
    console.log(`  获取到 ${intradayTrend.length} 条数据:`);
    const fiveDayTrend = await client.fiveDayTrend(secid);
    console.log(`  获取到 ${fiveDayTrend.length} 条数据:`);
  } catch (error) {
    console.error('  获取日线数据失败:', error);
  }
  console.log();

  // 测试获取日线数据
  console.log('📊 测试获取日线数据...');
  try {
    const klines = await client.dailyKline(secid, 5);
    console.log(`  获取到 ${klines.length} 条数据:`);
    klines.forEach((k) => {
      console.log(
        `  ${k.date}: 开${k.open} 高${k.high} 低${k.low} 收${k.close} 涨跌${k.pct}%`,
      );
    });
  } catch (error) {
    console.error('  获取日线数据失败:', error);
  }
  console.log();

  // // 测试快捷方法
  // console.log('⚡ 测试快捷方法 (宁德时代 300750)...');
  // try {
  //   const stock = client.stock('300750');
  //   const klines = await stock.daily(3);
  //   console.log(`  获取到 ${klines.length} 条日线数据`);

  //   const quote = await stock.quote();
  //   if (quote) {
  //     console.log(`  ${quote.name}: ${quote.price} (${quote.pct}%)`);
  //   }
  // } catch (error) {
  //   console.error('  快捷方法测试失败:', error);
  // }
  // console.log();

  console.log('✅ 测试完成！');
}

main().catch(console.error);
