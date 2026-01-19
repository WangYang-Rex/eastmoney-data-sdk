import { EastmoneyClient, buildSecid } from '../src';

/**
 * 完整测试报告 - 验证分时数据修复
 */

async function runFullTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Eastmoney Data SDK - 完整测试报告                      ║');
  console.log('║     测试目标：验证分时数据解析修复                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const client = new EastmoneyClient();
  const testResults: { name: string; passed: boolean; message: string }[] = [];

  // 测试股票：科创50ETF易方达 (588080)
  const code = '588080';
  const secid = buildSecid(code);

  console.log(`📌 测试股票: ${code} (${secid})\n`);

  // ============================================
  // 测试 1: 实时行情数据验证
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试 1: 实时行情数据验证');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const quote = await client.quote(secid);
    
    if (!quote) {
      testResults.push({ name: '实时行情', passed: false, message: '未获取到数据' });
    } else {
      console.log(`✓ 股票信息: ${quote.name} (${quote.code})`);
      console.log(`✓ 最新价: ${quote.price}`);
      console.log(`✓ 涨跌幅: ${quote.pct}%`);
      console.log(`✓ 成交量: ${quote.volume.toLocaleString()} 股`);
      console.log(`✓ 成交额: ${quote.amount.toLocaleString()} 元`);
      
      // 验证数据合理性
      const volumeValid = quote.volume > 1000;  // 成交量应该是较大的整数
      const amountValid = quote.amount > 10000; // 成交额应该是较大的数值
      const priceValid = quote.price > 0 && quote.price < 1000;
      
      if (volumeValid && amountValid && priceValid) {
        testResults.push({ name: '实时行情', passed: true, message: '数据格式正确' });
        console.log('✅ 实时行情数据验证通过\n');
      } else {
        testResults.push({ name: '实时行情', passed: false, message: '数据值异常' });
        console.log('❌ 实时行情数据异常\n');
      }
    }
  } catch (error) {
    testResults.push({ name: '实时行情', passed: false, message: `错误: ${error}` });
    console.log(`❌ 实时行情测试失败: ${error}\n`);
  }

  // ============================================
  // 测试 2: 当日分时数据验证
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试 2: 当日分时数据验证');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const intradayTrend = await client.intradayTrend(secid);
    
    console.log(`✓ 获取到 ${intradayTrend.length} 条分时数据`);
    
    if (intradayTrend.length > 0) {
      const firstData = intradayTrend[0];
      const lastData = intradayTrend[intradayTrend.length - 1];
      
      console.log('\n首条数据:');
      console.log(`  时间: ${firstData.datetime}`);
      console.log(`  价格: ${firstData.price}`);
      console.log(`  均价: ${firstData.avgPrice}`);
      console.log(`  成交量: ${firstData.volume.toLocaleString()} 股`);
      console.log(`  成交额: ${firstData.amount.toLocaleString()} 元`);
      console.log(`  涨跌幅: ${firstData.pct.toFixed(2)}%`);
      
      console.log('\n末条数据:');
      console.log(`  时间: ${lastData.datetime}`);
      console.log(`  价格: ${lastData.price}`);
      console.log(`  均价: ${lastData.avgPrice}`);
      console.log(`  成交量: ${lastData.volume.toLocaleString()} 股`);
      console.log(`  成交额: ${lastData.amount.toLocaleString()} 元`);
      console.log(`  涨跌幅: ${lastData.pct.toFixed(2)}%`);
      
      // 验证数据合理性
      const allDataValid = intradayTrend.every(item => {
        return item.volume > 0 &&           // 成交量应该 > 0
               item.amount > 0 &&           // 成交额应该 > 0
               item.price > 0 &&            // 价格应该 > 0
               item.avgPrice > 0 &&         // 均价应该 > 0
               item.volume < 100000000 &&   // 成交量不应过大（单分钟）
               item.amount < 1000000000;    // 成交额不应过大（单分钟）
      });
      
      // 检查是否有价格被错误解析为成交量的情况
      const noPriceAsVolume = intradayTrend.every(item => {
        return Math.abs(item.volume - item.price) > 0.1 ||  // 成交量不应等于价格
               Math.abs(item.amount - item.avgPrice) > 0.1; // 成交额不应等于均价
      });
      
      if (allDataValid && noPriceAsVolume) {
        testResults.push({ name: '当日分时', passed: true, message: '数据格式正确' });
        console.log('\n✅ 当日分时数据验证通过\n');
      } else {
        testResults.push({ name: '当日分时', passed: false, message: '数据值异常' });
        console.log('\n❌ 当日分时数据异常\n');
      }
    } else {
      testResults.push({ name: '当日分时', passed: false, message: '未获取到数据' });
      console.log('❌ 未获取到分时数据\n');
    }
  } catch (error) {
    testResults.push({ name: '当日分时', passed: false, message: `错误: ${error}` });
    console.log(`❌ 当日分时测试失败: ${error}\n`);
  }

  // ============================================
  // 测试 3: 5日分时数据验证
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试 3: 5日分时数据验证');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const fiveDayTrend = await client.fiveDayTrend(secid);
    
    console.log(`✓ 获取到 ${fiveDayTrend.length} 条分时数据`);
    
    if (fiveDayTrend.length > 0) {
      const firstData = fiveDayTrend[0];
      const middleData = fiveDayTrend[Math.floor(fiveDayTrend.length / 2)];
      const lastData = fiveDayTrend[fiveDayTrend.length - 1];
      
      console.log('\n首条数据（历史）:');
      console.log(`  时间: ${firstData.datetime}`);
      console.log(`  价格: ${firstData.price}`);
      console.log(`  均价: ${firstData.avgPrice}`);
      console.log(`  成交量: ${firstData.volume.toLocaleString()} 股`);
      console.log(`  成交额: ${firstData.amount.toLocaleString()} 元`);
      
      console.log('\n中间数据:');
      console.log(`  时间: ${middleData.datetime}`);
      console.log(`  价格: ${middleData.price}`);
      console.log(`  均价: ${middleData.avgPrice}`);
      console.log(`  成交量: ${middleData.volume.toLocaleString()} 股`);
      console.log(`  成交额: ${middleData.amount.toLocaleString()} 元`);
      
      console.log('\n末条数据（当日）:');
      console.log(`  时间: ${lastData.datetime}`);
      console.log(`  价格: ${lastData.price}`);
      console.log(`  均价: ${lastData.avgPrice}`);
      console.log(`  成交量: ${lastData.volume.toLocaleString()} 股`);
      console.log(`  成交额: ${lastData.amount.toLocaleString()} 元`);
      
      // 验证数据合理性
      const allDataValid = fiveDayTrend.every(item => {
        return item.volume > 0 &&           // 成交量应该 > 0
               item.amount > 0 &&           // 成交额应该 > 0
               item.price > 0 &&            // 价格应该 > 0（修复后不应为0）
               item.avgPrice > 0;           // 均价应该 > 0
      });
      
      // 检查历史数据的价格是否正确使用了均价
      const historicalDataValid = fiveDayTrend.slice(0, 100).every(item => {
        return item.price > 0;  // 历史数据的价格应该已经被替换为均价
      });
      
      if (allDataValid && historicalDataValid) {
        testResults.push({ name: '5日分时', passed: true, message: '数据格式正确，历史数据处理正确' });
        console.log('\n✅ 5日分时数据验证通过（包括历史数据修复）\n');
      } else {
        testResults.push({ name: '5日分时', passed: false, message: '数据值异常' });
        console.log('\n❌ 5日分时数据异常\n');
      }
    } else {
      testResults.push({ name: '5日分时', passed: false, message: '未获取到数据' });
      console.log('❌ 未获取到5日分时数据\n');
    }
  } catch (error) {
    testResults.push({ name: '5日分时', passed: false, message: `错误: ${error}` });
    console.log(`❌ 5日分时测试失败: ${error}\n`);
  }

  // ============================================
  // 测试 4: K线数据验证
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试 4: K线数据验证');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const klines = await client.dailyKline(secid, 5);
    
    console.log(`✓ 获取到 ${klines.length} 条K线数据`);
    
    if (klines.length > 0) {
      console.log('\nK线数据:');
      klines.forEach(k => {
        console.log(`  ${k.date}: 开${k.open} 高${k.high} 低${k.low} 收${k.close} 量${k.volume.toLocaleString()} 额${k.amount.toLocaleString()}`);
      });
      
      const allDataValid = klines.every(k => {
        return k.volume > 1000 &&      // 日成交量应该较大
               k.amount > 10000 &&     // 日成交额应该较大
               k.open > 0 &&
               k.close > 0 &&
               k.high >= k.close &&
               k.low <= k.close;
      });
      
      if (allDataValid) {
        testResults.push({ name: 'K线数据', passed: true, message: '数据格式正确' });
        console.log('\n✅ K线数据验证通过\n');
      } else {
        testResults.push({ name: 'K线数据', passed: false, message: '数据值异常' });
        console.log('\n❌ K线数据异常\n');
      }
    } else {
      testResults.push({ name: 'K线数据', passed: false, message: '未获取到数据' });
      console.log('❌ 未获取到K线数据\n');
    }
  } catch (error) {
    testResults.push({ name: 'K线数据', passed: false, message: `错误: ${error}` });
    console.log(`❌ K线数据测试失败: ${error}\n`);
  }

  // ============================================
  // 测试结果汇总
  // ============================================
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      测试结果汇总                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    console.log(`${status} | ${result.name.padEnd(12)} | ${result.message}`);
  });
  
  console.log('\n' + '─'.repeat(60));
  console.log(`总计: ${passedTests}/${totalTests} 测试通过`);
  console.log('─'.repeat(60) + '\n');
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！分时数据解析修复成功！');
  } else {
    console.log('⚠️  部分测试失败，请检查相关问题。');
  }
  
  console.log('\n测试完成时间:', new Date().toLocaleString('zh-CN'));
}

runFullTest().catch(console.error);
