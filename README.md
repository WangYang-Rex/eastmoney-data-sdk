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

## 📝 License

MIT
