# Eastmoney Data SDK

东方财富数据 SDK - 获取 A 股历史 K 线、实时行情、分时线等数据的 Node.js 工具包。

## ✨ 特性

- 📊 **完整数据覆盖**：历史 K 线、实时行情、分时线、股票列表
- 🔧 **TypeScript 支持**：完整的类型定义
- ⚡ **内置限流**：自动控制请求频率
- 🔄 **自动重试**：网络异常时自动重试
- 🎯 **量化友好**：返回结构化数据

## 📦 安装

```bash
npm install eastmoney-data-sdk
```

## 🚀 快速开始

```typescript
import { EastmoneyClient } from 'eastmoney-data-sdk';

const client = new EastmoneyClient();

// 获取贵州茅台日线数据
const klines = await client.dailyKline('1.600519', 100);

// 获取实时行情
const quote = await client.quote('1.600519');

// 获取当日分时
const trend = await client.intradayTrend('1.600519');
```

### 快捷方法

```typescript
const stock = client.stock('600519');  // 自动识别市场

const daily = await stock.daily(100);
const quote = await stock.quote();
const trend = await stock.trend();
```

## 📖 API

### K 线数据
- `getKLine(options)` - 通用 K 线
- `getDailyKLine(secid, limit)` - 日线
- `getWeeklyKLine(secid, limit)` - 周线
- `getMonthlyKLine(secid, limit)` - 月线
- `getMinuteKLine(secid, period, limit)` - 分钟线

### 实时行情
- `getQuote(options)` - 实时行情
- `getBatchQuote(secids)` - 批量行情

### 分时数据
- `getIntradayTrend(secid)` - 当日分时
- `get5DayTrend(secid)` - 5日分时

### 股票列表
- `getAShareList()` - A股列表
- `getETFList()` - ETF列表
- `getTopGainers()` - 涨幅榜
- `getTopLosers()` - 跌幅榜

### 工具函数
- `buildSecid(code)` - 构建 secid
- `detectMarket(code)` - 检测市场

## 📊 数据结构说明

### K 线数据 (KLine)

```typescript
{
  date: string;        // 日期/时间（如 2024-01-15 或 2024-01-15 09:30）
  open: number;        // 开盘价
  close: number;       // 收盘价
  high: number;        // 最高价
  low: number;         // 最低价
  volume: number;      // 成交量（股）
  amount: number;      // 成交额（元）
  amplitude: number;   // 振幅（%）
  pct: number;         // 涨跌幅（%）
  change: number;      // 涨跌额
  turnover: number;    // 换手率（%）
}
```

### 实时行情 (Quote)

```typescript
{
  code: string;              // 股票代码
  name: string;              // 股票名称
  price: number;             // 最新价
  high: number;              // 今日最高价
  low: number;               // 今日最低价
  open: number;              // 今日开盘价
  preClose: number;          // 昨日收盘价
  volume: number;            // 成交量（股）
  amount: number;            // 成交额（元）
  pct: number;               // 涨跌幅（%）
  change: number;            // 涨跌额
  turnover: number;          // 换手率（%）
  totalMarketCap: number;    // 总市值
  floatMarketCap: number;    // 流通市值
  pe: number;                // 市盈率（动态）
  pb: number;                // 市净率
  updateTime: number;        // 更新时间戳（Unix 时间戳，秒级）
}
```

**时间戳使用示例**：
```typescript
import { formatTimestamp } from 'eastmoney-data-sdk';

const quote = await client.quote('1.600519');

// 方式1：使用内置格式化函数
console.log(formatTimestamp(quote.updateTime));        // => '2026-01-19 16:11:42'
console.log(formatTimestamp(quote.updateTime, 'date')); // => '2026-01-19'

// 方式2：转换为 Date 对象
const date = new Date(quote.updateTime * 1000);
console.log(date.toLocaleString('zh-CN'));
```


### 分时数据 (TrendData)

```typescript
{
  datetime: string;    // 完整日期时间（YYYY-MM-DD HH:mm）
  time: string;        // 时间（HH:mm 格式）
  price: number;       // 当前价格（历史数据中使用均价）
  avgPrice: number;    // 均价
  volume: number;      // 成交量（股）
  amount: number;      // 成交额（元）
  pct: number;         // 涨跌幅（%）
}
```

**注意**：
- 在 5 日分时等历史数据中，`price` 字段可能为 0，SDK 会自动使用 `avgPrice` 作为价格
- 分时数据的原始格式包含 8 个字段：`datetime,price,avgPrice,high,low,volume,amount,extra`

## 🔧 高级用法

### 自定义配置

```typescript
import { EastmoneyClient } from 'eastmoney-data-sdk';

const client = new EastmoneyClient({
  throttle: 200,      // 请求间隔（毫秒），默认 100
  retries: 3,         // 重试次数，默认 2
  timeout: 10000      // 超时时间（毫秒），默认 5000
});
```

### 获取指定日期范围的 K 线

```typescript
const klines = await client.kline({
  secid: '1.600519',
  klt: 101,              // 101=日线, 102=周线, 103=月线
  fqt: 1,                // 0=不复权, 1=前复权, 2=后复权
  startDate: '20240101', // 开始日期（YYYYMMDD）
  endDate: '20240131',   // 结束日期（YYYYMMDD）
  limit: 1000            // 最大返回条数
});
```

### 批量获取行情

```typescript
const quotes = await client.batchQuote([
  '1.600519',  // 贵州茅台
  '0.000001',  // 平安银行
  '1.688111'   // 金山办公
]);

quotes.forEach(quote => {
  if (quote) {
    console.log(`${quote.name}: ${quote.price} (${quote.pct}%)`);
  }
});
```

## 🐛 调试

SDK 内置了详细的日志输出：

```typescript
// 查看网络错误
[Eastmoney SDK] Network Error: No response received
[Eastmoney SDK] Request failed, retrying (1/2)...

// 查看数据警告
[Eastmoney SDK] No trend data for secid: 1.600519
[Eastmoney SDK] Invalid trend data: ...
```

## 📚 更多文档

- [分时数据解析修复说明](./docs/TREND_DATA_FIX.md)
- [API 字段映射表](./docs/API_FIELDS.md)

## 📝 License

MIT

