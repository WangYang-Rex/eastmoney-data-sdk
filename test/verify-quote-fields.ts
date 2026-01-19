import { EastmoneyClient, formatTimestamp } from '../src';

/**
 * 验证 PE/PB/updateTime 字段修复
 */

async function testQuoteFields() {
  console.log('🔍 验证实时行情字段修复\n');

  const client = new EastmoneyClient();

  const testCases = [
    { name: 'ETF (科创50)', code: '588080' },
    { name: '股票 (贵州茅台)', code: '600519' },
    { name: '股票 (平安银行)', code: '000001' }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试: ${testCase.name} (${testCase.code})`);
    console.log('='.repeat(60));

    try {
      const secid = testCase.code.startsWith('6') ? `1.${testCase.code}` : `0.${testCase.code}`;
      const quote = await client.quote(secid);
      
      if (quote) {
        console.log(`\n【基本信息】`);
        console.log(`  股票名称: ${quote.name}`);
        console.log(`  股票代码: ${quote.code}`);
        console.log(`  最新价: ${quote.price}`);
        console.log(`  涨跌幅: ${quote.pct}%`);
        
        console.log(`\n【估值信息】`);
        console.log(`  市盈率 (PE): ${quote.pe}`);
        console.log(`  市净率 (PB): ${quote.pb}`);
        console.log(`  └─ 类型检查: ${typeof quote.pe === 'number' ? '✅ number' : '❌ ' + typeof quote.pe}`);
        console.log(`  └─ 类型检查: ${typeof quote.pb === 'number' ? '✅ number' : '❌ ' + typeof quote.pb}`);
        
        console.log(`\n【时间信息】`);
        console.log(`  更新时间戳: ${quote.updateTime}`);
        console.log(`  └─ 类型检查: ${typeof quote.updateTime === 'number' ? '✅ number' : '❌ ' + typeof quote.updateTime}`);
        console.log(`  └─ 格式化时间: ${formatTimestamp(quote.updateTime)}`);
        console.log(`  └─ 仅日期: ${formatTimestamp(quote.updateTime, 'date')}`);
        
        console.log(`\n【市值信息】`);
        console.log(`  总市值: ${(quote.totalMarketCap / 100000000).toFixed(2)} 亿`);
        console.log(`  流通市值: ${(quote.floatMarketCap / 100000000).toFixed(2)} 亿`);
        
        // 验证
        const checks = [
          { name: 'PE 类型', pass: typeof quote.pe === 'number' },
          { name: 'PB 类型', pass: typeof quote.pb === 'number' },
          { name: 'updateTime 类型', pass: typeof quote.updateTime === 'number' },
          { name: 'updateTime 值', pass: quote.updateTime > 0 }
        ];
        
        const allPass = checks.every(c => c.pass);
        console.log(`\n【验证结果】`);
        checks.forEach(check => {
          console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
        });
        
        if (allPass) {
          console.log(`\n🎉 所有字段验证通过！`);
        } else {
          console.log(`\n⚠️  部分字段验证失败`);
        }
      }
    } catch (error) {
      console.error(`❌ 获取失败: ${error}`);
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ 测试完成！');
  console.log('='.repeat(60));
}

testQuoteFields().catch(console.error);
