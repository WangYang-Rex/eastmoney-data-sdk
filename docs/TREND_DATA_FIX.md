# 分时数据解析问题修复文档

## 📋 问题概述

在测试分时数据时，发现 `volume`（成交量）和 `amount`（成交额）字段的值异常，显示为与价格相近的小数值，而不是预期的大数值。

### 问题示例

```typescript
// 错误的数据（修复前）
{
  datetime: '2026-01-19 09:34',
  time: '09:34',
  price: 1.541,
  avgPrice: 1.535,
  volume: 1.541,    // ❌ 错误：应该是成交量，却显示为价格
  amount: 1.534,    // ❌ 错误：应该是成交额，却显示为价格
  pct: -0.06485084306096704
}

// 正确的数据（修复后）
{
  datetime: '2026-01-19 09:34',
  time: '09:34',
  price: 1.541,
  avgPrice: 1.535,
  volume: 110323,      // ✅ 正确：成交量（股）
  amount: 16956705,    // ✅ 正确：成交额（元）
  pct: -0.06
}
```

## 🔍 问题分析

### 1. API 原始数据格式调查

通过创建调试脚本 `test/debug-trend.ts`，我们发现东方财富 API 返回的分时数据格式为：

```
2026-01-19 09:34,1.541,1.535,1.541,1.534,110323,16956705.000,1.5407
```

**实际字段顺序（8 个字段）**：
```
[0] datetime  - 日期时间（YYYY-MM-DD HH:mm）
[1] price     - 当前价格
[2] avgPrice  - 均价
[3] high      - 分时最高价 ⚠️
[4] low       - 分时最低价 ⚠️
[5] volume    - 成交量（股）
[6] amount    - 成交额（元）
[7] extra     - 其他数据
```

### 2. 错误的解析逻辑

修复前的代码 (`src/utils/parser.ts`) 错误地认为字段顺序是：

```typescript
// ❌ 错误的解析
const [datetime, price, avgPrice, volume, amount] = parts;
```

这导致：
- `parts[3]`（实际是 high）被当作 `volume`
- `parts[4]`（实际是 low）被当作 `amount`
- 真正的 `volume` 和 `amount` 被忽略

## 🔧 解决方案

### 修复 1：纠正字段解析顺序

```typescript
// ✅ 正确的解析
const [datetime, price, avgPrice, high, low, volume, amount] = parts;
```

### 修复 2：处理 5 日分时数据的特殊情况

在调查 5 日分时数据时，发现历史数据的 `price` 字段为 `0`：

```
2026-01-13 09:30,0.000,1.540,1.540,1.540,28800,4435200.000,1.5400
                 ^^^^^ price 为 0
```

**原因**：历史分时数据不保存每分钟的最后成交价，只保存均价和成交量/额。

**解决方案**：当 `price` 为 `0` 时，使用 `avgPrice` 作为价格

```typescript
const priceNum = parseFloat(price) || 0;
const avgPriceNum = parseFloat(avgPrice) || 0;

// 在历史分时数据中，price 可能为 0，此时使用 avgPrice
const actualPrice = priceNum > 0 ? priceNum : avgPriceNum;

return {
  datetime,
  time: timePart,
  price: actualPrice,        // 使用 actualPrice
  avgPrice: avgPriceNum,
  volume: parseFloat(volume) || 0,
  amount: parseFloat(amount) || 0,
  pct: preClose ? ((actualPrice - preClose) / preClose) * 100 : 0
};
```

## 📊 修复验证

### 当日分时数据测试

```bash
当日分时: 获取到 241 条数据
前3条数据示例:
  2026-01-19 09:30 | 价格:1.54 均价:1.54 | 量:51559 额:7940092 | 涨跌:-0.13%
  2026-01-19 09:31 | 价格:1.54 均价:1.541 | 量:145680 额:22440790 | 涨跌:-0.13%
  2026-01-19 09:32 | 价格:1.542 均价:1.545 | 量:192854 额:29748925 | 涨跌:0.00%
```

✅ 成交量和成交额显示正常

### 5 日分时数据测试

```bash
5日分时: 获取到 1205 条数据
前3条数据示例:
  2026-01-13 09:30 | 价格:1.54 均价:1.54 | 量:28800 额:4435200 | 涨跌:-0.13%
  2026-01-13 09:31 | 价格:1.538 均价:1.538 | 量:119872 额:18440059 | 涨跌:-0.26%
  2026-01-13 09:32 | 价格:1.54 均价:1.54 | 量:147366 额:22685297 | 涨跌:-0.13%
```

✅ 历史数据的价格使用均价，成交量和成交额正常

## 📝 修改的文件

1. **`src/utils/parser.ts`**
   - 修正 `parseTrends()` 函数的字段解析顺序
   - 添加历史数据 price 为 0 的处理逻辑
   - 更新注释说明实际的字段格式

2. **`test/debug-trend.ts`** (新增)
   - 调试当日分时数据的原始格式

3. **`test/debug-5day-trend.ts`** (新增)
   - 调试 5 日分时数据的原始格式

4. **`test/588080.ts`** (优化)
   - 添加详细的数据输出，便于验证修复效果

## 🎯 关键要点

1. **API 字段顺序**：东方财富分时 API 返回 8 个字段，不是 5 个
2. **历史数据特性**：5 日分时等历史数据的 `price` 字段为 0，需使用 `avgPrice`
3. **数据完整性检查**：修改验证逻辑从 `parts.length < 3` 改为 `parts.length < 7`
4. **向后兼容**：保留 `time` 字段（仅时间部分）以兼容旧版本

## 📚 相关资源

- 东方财富分时 API：`https://push2.eastmoney.com/api/qt/stock/trends2/get`
- 东方财富历史分时 API：`https://push2his.eastmoney.com/api/qt/stock/trends2/get`
- 类型定义：`src/types/quote.ts` - `TrendData` 接口

## ✅ 测试清单

- [x] 当日分时数据解析正确
- [x] 5 日分时数据解析正确
- [x] 历史数据 price 为 0 的情况处理正确
- [x] 成交量和成交额数值正常
- [x] 涨跌幅计算正确
- [x] 向后兼容性保持

---

**修复日期**: 2026-01-19  
**修复版本**: v1.0.1  
**问题严重程度**: 高（数据解析错误会导致业务逻辑异常）
