import { EastmoneyClient } from '../src';

/**
 * 测试不同类型证券的 PE/PB 值
 */

async function testPEPB() {
  console.log('🔍 测试 PE/PB 字段\n');

  const client = new EastmoneyClient();

  const testCases = [
    { name: 'ETF (科创50)', code: '588080', type: 'ETF' },
    { name: '股票 (贵州茅台)', code: '600519', type: '股票' },
    { name: '股票 (平安银行)', code: '000001', type: '股票' }
  ];

  for (const testCase of testCases) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`测试: ${testCase.name} (${testCase.code}) - ${testCase.type}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      const quote = await client.quote(`${testCase.code.startsWith('6') ? '1' : '0'}.${testCase.code}`);
      
      if (quote) {
        console.log(`✓ 股票名称: ${quote.name}`);
        console.log(`✓ 最新价: ${quote.price}`);
        console.log(`✓ 市盈率 (PE): ${quote.pe}`);
        console.log(`✓ 市净率 (PB): ${quote.pb}`);
        console.log(`✓ 更新时间: ${quote.updateTime}`);
        
        // 转换时间戳
        const timestamp = Number(quote.updateTime);
        if (!isNaN(timestamp) && timestamp > 0) {
          const date = new Date(timestamp * 1000);
          console.log(`  └─ 格式化时间: ${date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
        }
        
        // 验证
        if (testCase.type === 'ETF') {
          console.log(`\n📌 ETF 产品，PE/PB 为 0 是正常的`);
        } else {
          if (quote.pe > 0 && quote.pb > 0) {
            console.log(`\n✅ 股票的 PE/PB 值正常`);
          } else {
            console.log(`\n⚠️  股票的 PE/PB 值为 0，可能需要检查`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ 获取失败: ${error}`);
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

testPEPB().catch(console.error);
