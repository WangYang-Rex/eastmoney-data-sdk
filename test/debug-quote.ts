import { http, withRetry } from '../src/utils/request';
import { EASTMONEY_BASE } from '../src/config';
import { buildSecid } from '../src';

/**
 * 调试脚本：查看实时行情的原始 API 响应
 * 重点检查 pb, pe, updateTime 字段
 */

async function debugQuoteData() {
  console.log('🔍 调试实时行情 API 响应\n');

  const code = '588080';
  const secid = buildSecid(code);

  // 构建请求参数
  const params = {
    secid,
    fltt: 2,
    fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f86,f116,f117,f162,f167,f168,f169,f170',
    _: Date.now()
  };

  try {
    console.log('📡 请求参数:', params);
    console.log('📡 API URL:', EASTMONEY_BASE.QUOTE);
    console.log();

    const res = await withRetry(
      () => http.get<{ data: any }>(EASTMONEY_BASE.QUOTE, { params }),
      2,
      500
    );

    const data = res.data?.data;

    if (!data) {
      console.error('❌ 未获取到数据');
      return;
    }

    console.log('✅ API 响应数据结构:');
    console.log('完整响应:', JSON.stringify(data, null, 2));
    console.log();

    console.log('📊 关键字段详细信息:');
    console.log('─'.repeat(60));
    
    // 基础信息
    console.log('\n【基础信息】');
    console.log(`  f57 (code):      ${data.f57}`);
    console.log(`  f58 (name):      ${data.f58}`);
    
    // 价格信息
    console.log('\n【价格信息】');
    console.log(`  f43 (price):     ${data.f43}`);
    console.log(`  f44 (high):      ${data.f44}`);
    console.log(`  f45 (low):       ${data.f45}`);
    console.log(`  f46 (open):      ${data.f46}`);
    console.log(`  f60 (preClose):  ${data.f60}`);
    
    // 成交信息
    console.log('\n【成交信息】');
    console.log(`  f47 (volume):    ${data.f47}`);
    console.log(`  f48 (amount):    ${data.f48}`);
    console.log(`  f168 (turnover): ${data.f168}`);
    console.log(`  f169 (change):   ${data.f169}`);
    console.log(`  f170 (pct):      ${data.f170}`);
    
    // 市值信息
    console.log('\n【市值信息】');
    console.log(`  f116 (totalMarketCap):  ${data.f116}`);
    console.log(`  f117 (floatMarketCap):  ${data.f117}`);
    
    // 估值信息 - 重点检查
    console.log('\n【估值信息】⚠️ 重点检查');
    console.log(`  f162 (pe):       ${data.f162} (类型: ${typeof data.f162})`);
    console.log(`  f167 (pb):       ${data.f167} (类型: ${typeof data.f167})`);
    
    // 时间信息 - 重点检查
    console.log('\n【时间信息】⚠️ 重点检查');
    console.log(`  f86 (updateTime): ${data.f86} (类型: ${typeof data.f86})`);
    
    // 检查是否存在其他可能的字段
    console.log('\n【其他字段】');
    const knownFields = ['f43','f44','f45','f46','f47','f48','f57','f58','f60','f86','f116','f117','f162','f167','f168','f169','f170'];
    Object.keys(data).forEach(key => {
      if (!knownFields.includes(key)) {
        console.log(`  ${key}: ${data[key]} (类型: ${typeof data[key]})`);
      }
    });
    
    console.log('\n' + '─'.repeat(60));
    
    // 验证数据合理性
    console.log('\n🔍 数据合理性检查:');
    
    const checks = [
      { name: 'PE (f162)', value: data.f162, expected: '应该是数字或0', valid: typeof data.f162 === 'number' || data.f162 === undefined },
      { name: 'PB (f167)', value: data.f167, expected: '应该是数字或0', valid: typeof data.f167 === 'number' || data.f167 === undefined },
      { name: 'UpdateTime (f86)', value: data.f86, expected: '应该是时间戳字符串', valid: typeof data.f86 === 'string' || typeof data.f86 === 'number' }
    ];
    
    checks.forEach(check => {
      const status = check.valid ? '✅' : '❌';
      console.log(`  ${status} ${check.name}: ${check.value} (${check.expected})`);
    });
    
    // 解析 updateTime
    if (data.f86) {
      console.log('\n📅 时间戳解析:');
      const timeStr = String(data.f86);
      console.log(`  原始值: ${timeStr}`);
      
      // 尝试解析时间戳格式
      if (timeStr.length === 12) {
        // 格式：YYYYMMDDHHmm
        const year = timeStr.substring(0, 4);
        const month = timeStr.substring(4, 6);
        const day = timeStr.substring(6, 8);
        const hour = timeStr.substring(8, 10);
        const minute = timeStr.substring(10, 12);
        console.log(`  解析为: ${year}-${month}-${day} ${hour}:${minute}`);
      } else {
        console.log(`  格式未知（长度: ${timeStr.length}）`);
      }
    }

  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

debugQuoteData().catch(console.error);
