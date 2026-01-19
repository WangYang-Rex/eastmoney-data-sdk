# 东方财富 API 字段映射表

本文档详细说明了东方财富 API 返回的原始字段与 SDK 数据结构的映射关系。

## 📊 分时数据 (Trend Data)

### API 端点

- **当日分时**: `https://push2.eastmoney.com/api/qt/stock/trends2/get`
- **历史分时**: `https://push2his.eastmoney.com/api/qt/stock/trends2/get`

### 原始数据格式

分时数据以逗号分隔的字符串数组形式返回，每条记录包含 **8 个字段**：

```
2026-01-19 09:34,1.541,1.535,1.541,1.534,110323,16956705.000,1.5407
```

### 字段映射

| 索引 | 原始字段 | SDK 字段 | 类型 | 说明 |
|------|---------|---------|------|------|
| [0] | datetime | `datetime` | string | 日期时间（YYYY-MM-DD HH:mm） |
| [1] | price | `price` | number | 当前价格（历史数据中为 0） |
| [2] | avgPrice | `avgPrice` | number | 均价 |
| [3] | high | - | number | 分时最高价（SDK 未使用） |
| [4] | low | - | number | 分时最低价（SDK 未使用） |
| [5] | volume | `volume` | number | 成交量（股） |
| [6] | amount | `amount` | number | 成交额（元） |
| [7] | extra | - | number | 其他数据（SDK 未使用） |

### 特殊处理

1. **时间字段**：从 `datetime` 中提取时间部分生成 `time` 字段（HH:mm 格式）
2. **历史数据价格**：当 `price` 为 0 时（历史数据），使用 `avgPrice` 作为价格
3. **涨跌幅计算**：`pct = ((price - preClose) / preClose) * 100`

### 示例代码

```typescript
// 原始数据
const rawData = "2026-01-19 09:34,1.541,1.535,1.541,1.534,110323,16956705.000,1.5407";

// 解析后的数据
const trendData: TrendData = {
  datetime: "2026-01-19 09:34",
  time: "09:34",
  price: 1.541,
  avgPrice: 1.535,
  volume: 110323,
  amount: 16956705,
  pct: -0.06  // 相对于昨收价 1.542
};
```

## 📈 K 线数据 (KLine Data)

### API 端点

`https://push2his.eastmoney.com/api/qt/stock/kline/get`

### 原始数据格式

K 线数据以逗号分隔的字符串数组形式返回，每条记录包含 **11 个字段**：

```
2026-01-19,1.540,1.536,1.555,1.531,31920675,4911089443,1.56,0.39,0.006,0.00
```

### 字段映射

| 索引 | 原始字段 | SDK 字段 | 类型 | 说明 |
|------|---------|---------|------|------|
| [0] | date | `date` | string | 日期（YYYY-MM-DD）或时间（YYYY-MM-DD HH:mm） |
| [1] | open | `open` | number | 开盘价 |
| [2] | close | `close` | number | 收盘价 |
| [3] | high | `high` | number | 最高价 |
| [4] | low | `low` | number | 最低价 |
| [5] | volume | `volume` | number | 成交量（股） |
| [6] | amount | `amount` | number | 成交额（元） |
| [7] | amplitude | `amplitude` | number | 振幅（%） |
| [8] | pct | `pct` | number | 涨跌幅（%） |
| [9] | change | `change` | number | 涨跌额 |
| [10] | turnover | `turnover` | number | 换手率（%） |

### 示例代码

```typescript
// 原始数据
const rawData = "2026-01-19,1.540,1.536,1.555,1.531,31920675,4911089443,1.56,0.39,0.006,0.00";

// 解析后的数据
const klineData: KLine = {
  date: "2026-01-19",
  open: 1.540,
  close: 1.536,
  high: 1.555,
  low: 1.531,
  volume: 31920675,
  amount: 4911089443,
  amplitude: 1.56,
  pct: 0.39,
  change: 0.006,
  turnover: 0.00
};
```

## 💹 实时行情 (Quote Data)

### API 端点

`https://push2.eastmoney.com/api/qt/stock/get`

### 原始数据格式

实时行情以 JSON 对象形式返回，使用 `f` 开头的字段编号：

```json
{
  "f43": 1.536,
  "f44": 1.555,
  "f45": 1.531,
  "f46": 1.540,
  "f47": 31920675,
  "f48": 4911089443,
  "f57": "588080",
  "f58": "科创50ETF易方达",
  "f60": 1.542,
  "f162": 0,
  "f167": 0,
  "f168": 0,
  "f169": -0.006,
  "f170": -0.39,
  "f116": 0,
  "f117": 0,
  "f86": "202601191500"
}
```

### 字段映射

| 原始字段 | SDK 字段 | 类型 | 说明 |
|---------|---------|------|------|
| f57 | `code` | string | 股票代码 |
| f58 | `name` | string | 股票名称 |
| f43 | `price` | number | 最新价 |
| f44 | `high` | number | 今日最高价 |
| f45 | `low` | number | 今日最低价 |
| f46 | `open` | number | 今日开盘价 |
| f60 | `preClose` | number | 昨日收盘价 |
| f47 | `volume` | number | 成交量（股） |
| f48 | `amount` | number | 成交额（元） |
| f170 | `pct` | number | 涨跌幅（%） |
| f169 | `change` | number | 涨跌额 |
| f168 | `turnover` | number | 换手率（%） |
| f116 | `totalMarketCap` | number | 总市值 |
| f117 | `floatMarketCap` | number | 流通市值 |
| f162 | `pe` | number | 市盈率（动态） |
| f167 | `pb` | number | 市净率 |
| f86 | `updateTime` | string | 更新时间戳 |

### 示例代码

```typescript
// 原始数据
const rawData = {
  f43: 1.536,
  f57: "588080",
  f58: "科创50ETF易方达",
  f170: -0.39,
  // ... 其他字段
};

// 解析后的数据
const quoteData: Quote = {
  code: "588080",
  name: "科创50ETF易方达",
  price: 1.536,
  pct: -0.39,
  // ... 其他字段
};
```

## 🔧 请求参数说明

### 分时数据请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| secid | string | 证券 ID（市场代码.股票代码） | `1.588080` |
| ndays | number | 天数（1=当日，5=5日） | `1` 或 `5` |
| fields1 | string | 字段组 1 | `f1,f2,f3,...` |
| fields2 | string | 字段组 2 | `f51,f52,...` |
| iscr | number | 是否创业板 | `0` |
| iscca | number | 是否 CCA | `0` |
| _ | number | 时间戳（防缓存） | `1768834424370` |

### K 线数据请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| secid | string | 证券 ID | `1.588080` |
| klt | number | K 线周期（101=日线，102=周线，103=月线） | `101` |
| fqt | number | 复权类型（0=不复权，1=前复权，2=后复权） | `1` |
| lmt | number | 返回数据条数 | `100` |
| beg | string | 开始日期（YYYYMMDD） | `20240101` |
| end | string | 结束日期（YYYYMMDD） | `20240131` |
| fields1 | string | 字段组 1 | `f1,f2,f3,...` |
| fields2 | string | 字段组 2 | `f51,f52,...` |

### 实时行情请求参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| secid | string | 证券 ID | `1.588080` |
| fltt | number | 数据格式化类型 | `2` |
| fields | string | 返回字段列表 | `f43,f44,f45,...` |

## 📝 注意事项

1. **字段编号不连续**：东方财富 API 使用 `f` 开头的字段编号，编号不连续且含义固定
2. **数据格式差异**：分时和 K 线数据使用逗号分隔字符串，行情数据使用 JSON 对象
3. **历史数据特性**：5 日分时等历史数据的 `price` 字段为 0，需特殊处理
4. **时间戳格式**：不同 API 的时间戳格式可能不同，需要统一处理
5. **数值精度**：某些字段（如成交额）可能包含小数点，需要使用 `parseFloat` 解析

## 🔗 相关资源

- [东方财富官网](https://www.eastmoney.com/)
- [分时数据修复说明](./TREND_DATA_FIX.md)
- [SDK 源码](https://github.com/yourusername/eastmoney-data-sdk)

---

**最后更新**: 2026-01-19  
**SDK 版本**: v1.0.1
