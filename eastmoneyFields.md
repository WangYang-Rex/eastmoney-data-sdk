好，这一条我给你**做成“准文档级别”的整理**，包含三部分：

> **① 历史 K 线完整字段清单（逐字段解释）**
> **② Eastmoney 历史 K 线 API 全参数模板（日线 / 分钟线 / 复权 / ETF）**
> **③ 一套可直接复用的 Node.js API 模板集合**

你可以**直接当内部接口文档用**。

---

# 一、历史 K 线接口（唯一主入口）

```
GET https://push2his.eastmoney.com/api/qt/stock/kline/get
```

---

# 二、完整参数清单（不是只够用，是全量）

## 1️⃣ 核心必选参数

| 参数    | 示例         | 含义    |
| ----- | ---------- | ----- |
| secid | `1.600519` | 市场.代码 |
| klt   | `101`      | K 线类型 |
| fqt   | `1`        | 复权类型  |
| lmt   | `1000`     | 返回条数  |

---

## 2️⃣ klt（K 线周期全集）

| klt     | 含义     |
| ------- | ------ |
| 1       | 1 分钟   |
| 5       | 5 分钟   |
| 15      | 15 分钟  |
| 30      | 30 分钟  |
| 60      | 60 分钟  |
| **101** | **日线** |
| 102     | 周线     |
| 103     | 月线     |

📌 **分钟线 = 可做日内研究，但不建议高频**

---

## 3️⃣ fqt（复权方式）

| fqt   | 含义      | 使用建议       |
| ----- | ------- | ---------- |
| 0     | 不复权     | 仅展示        |
| **1** | **前复权** | **量化回测推荐** |
| 2     | 后复权     | 长期对数收益     |

---

## 4️⃣ fields1（基础字段，固定）

```text
f1,f2,f3,f4,f5,f6
```

| 字段 | 含义      |
| -- | ------- |
| f1 | 无意义（占位） |
| f2 | 股票代码    |
| f3 | 股票名称    |
| f4 | 市场类型    |
| f5 | 未知      |
| f6 | 未知      |

📌 **基本不用解析，必须传**

---

## 5️⃣ fields2（K 线核心字段全集 ⭐）

```text
f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61
```

### 字段逐一解释（非常重要）

| 顺序  | 字段     | 含义 |
| --- | ------ | -- |
| f51 | 日期     |    |
| f52 | 开盘价    |    |
| f53 | 收盘价    |    |
| f54 | 最高价    |    |
| f55 | 最低价    |    |
| f56 | 成交量    |    |
| f57 | 成交额    |    |
| f58 | 振幅（%）  |    |
| f59 | 涨跌幅（%） |    |
| f60 | 涨跌额    |    |
| f61 | 换手率（%） |    |

📌 `data.klines` 返回的字符串顺序 **严格等于此顺序**

---

# 三、返回结构完整示例

```json
{
  "rc": 0,
  "rt": 4,
  "svr": 181652642,
  "data": {
    "code": "600519",
    "market": 1,
    "name": "贵州茅台",
    "klines": [
      "2024-01-05,1635.50,1642.30,1621.00,1640.10,345678,5.12,1.23,10.5",
      ...
    ]
  }
}
```

---

# 四、全 API 模板（直接复制用）

---

## ✅ 模板 1：股票 / ETF 日线（前复权）

```text
https://push2his.eastmoney.com/api/qt/stock/kline/get
?secid=1.588080
&klt=101
&fqt=1
&lmt=2000
&fields1=f1,f2,f3,f4,f5,f6
&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61
```

---

## ✅ 模板 2：分钟线（5 分钟）

```text
klt=5
fqt=1
```

📌 **注意**：分钟线历史长度有限，且访问频繁容易限流

---

## ✅ 模板 3：周线 / 月线

```text
klt=102   // 周线
klt=103   // 月线
```

---

## ✅ 模板 4：不复权 K 线（对照用）

```text
fqt=0
```

---

# 五、Node.js 全功能封装（推荐直接用）

```js
import axios from "axios";

export async function fetchEastmoneyKline({
  secid,
  klt = 101,
  fqt = 1,
  lmt = 1000
}) {
  const res = await axios.get(
    "https://push2his.eastmoney.com/api/qt/stock/kline/get",
    {
      params: {
        secid,
        klt,
        fqt,
        lmt,
        fields1: "f1,f2,f3,f4,f5,f6",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61"
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://quote.eastmoney.com/"
      }
    }
  );

  return res.data.data.klines.map(line => {
    const [
      date, open, close, high, low,
      volume, amount, amplitude,
      pct, change, turnover
    ] = line.split(",");

    return {
      date,
      open: +open,
      close: +close,
      high: +high,
      low: +low,
      volume: +volume,
      amount: +amount,
      amplitude: +amplitude,
      pct: +pct,
      change: +change,
      turnover: +turnover
    };
  });
}
```

---

# 六、实战建议（量化角度）

✔ **历史回测：日线 + 前复权**
✔ **ETF / 指数策略：忽略成交额 / 换手即可**
❌ **不建议分钟线做实盘自动化**

---

# 七、你下一步可以直接做的 3 件事

1️⃣ 把这套接口 **封装成 data-service（Node 微服务）**
2️⃣ 接入你自己的 **量化回测 / 网格 / MA 策略**
3️⃣ 做一个 **A 股 K 线本地数据库（MySQL / DuckDB）**

如果你愿意，我可以**下一条直接帮你**：

* 把它做成 **完整 Eastmoney Data SDK（Node）**
* 或 **设计一套 A 股历史行情数据库表结构**
* 或 **直接用 588080 给你跑一个策略示例**

你选一个，我直接继续。
