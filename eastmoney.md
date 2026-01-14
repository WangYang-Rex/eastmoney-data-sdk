很好，这一步你已经是**工程化思维**了 👍
下面我直接给你一套 **「可发布 / 可维护 / 可扩展」的 Eastmoney Data SDK（Node.js）设计 + 完整代码骨架**。

你可以：

* 直接放进自己项目
* 或单独做成 npm 包（`eastmoney-data-sdk`）

---

# 一、SDK 设计目标（先说清楚）

✅ Node.js 原生（axios / fetch）
✅ 覆盖 **历史 K 线 / 实时行情 / 分钟线 / ETF**
✅ 字段强类型、自动解析
✅ 限流 + Header 内置
✅ 量化友好（直接返回结构化数据）

---

# 二、SDK 目录结构（标准 npm 包）

```txt
eastmoney-data-sdk/
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── config.ts
│   ├── utils/
│   │   ├── request.ts
│   │   ├── parser.ts
│   │   └── throttle.ts
│   ├── api/
│   │   ├── kline.ts
│   │   ├── quote.ts
│   │   └── intraday.ts
│   └── types/
│       ├── kline.ts
│       ├── quote.ts
│       └── common.ts
├── package.json
└── README.md
```

> 如果你不用 TS，我也可以下一步给你 **纯 JS 版**

---

# 三、核心实现（逐文件给你）

---

## 1️⃣ config.ts（全局配置）

```ts
export const EASTMONEY_BASE = {
  KLINE: "https://push2his.eastmoney.com/api/qt/stock/kline/get",
  QUOTE: "https://push2.eastmoney.com/api/qt/stock/get"
};

export const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Referer": "https://quote.eastmoney.com/"
};

export const DEFAULT_TIMEOUT = 10_000;
```

---

## 2️⃣ utils/request.ts（统一请求封装）

```ts
import axios from "axios";
import { DEFAULT_HEADERS, DEFAULT_TIMEOUT } from "../config";

export const http = axios.create({
  timeout: DEFAULT_TIMEOUT,
  headers: DEFAULT_HEADERS
});
```

---

## 3️⃣ utils/throttle.ts（简单限流）

```ts
let last = 0;

export async function throttle(ms = 300) {
  const now = Date.now();
  const diff = now - last;
  if (diff < ms) {
    await new Promise(r => setTimeout(r, ms - diff));
  }
  last = Date.now();
}
```

---

## 4️⃣ types/kline.ts（K 线类型定义）

```ts
export interface KLine {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  amplitude: number;
  pct: number;
  change: number;
  turnover: number;
}

export interface KLineOptions {
  secid: string;     // 1.600519
  klt?: number;      // 101
  fqt?: number;      // 1
  limit?: number;    // 1000
}
```

---

## 5️⃣ utils/parser.ts（K 线解析器）

```ts
import { KLine } from "../types/kline";

export function parseKLines(klines: string[]): KLine[] {
  return klines.map(line => {
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

## 6️⃣ api/kline.ts（历史 K 线 API）

```ts
import { http } from "../utils/request";
import { throttle } from "../utils/throttle";
import { EASTMONEY_BASE } from "../config";
import { parseKLines } from "../utils/parser";
import { KLineOptions } from "../types/kline";

export async function getKLine({
  secid,
  klt = 101,
  fqt = 1,
  limit = 1000
}: KLineOptions) {

  await throttle();

  const res = await http.get(EASTMONEY_BASE.KLINE, {
    params: {
      secid,
      klt,
      fqt,
      lmt: limit,
      fields1: "f1,f2,f3,f4,f5,f6",
      fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61"
    }
  });

  return parseKLines(res.data?.data?.klines || []);
}
```

---

## 7️⃣ api/quote.ts（实时行情）

```ts
import { http } from "../utils/request";
import { throttle } from "../utils/throttle";
import { EASTMONEY_BASE } from "../config";

export async function getQuote(secid: string) {
  await throttle();

  const res = await http.get(EASTMONEY_BASE.QUOTE, {
    params: {
      secid,
      fields: "f43,f44,f45,f47,f48,f170",
      invt: 2,
      fltt: 2
    }
  });

  const d = res.data?.data;
  return {
    price: d?.f43,
    high: d?.f44,
    low: d?.f45,
    volume: d?.f47,
    amount: d?.f48,
    pct: d?.f170
  };
}
```

---

## 8️⃣ client.ts（SDK 主入口）

```ts
import { getKLine } from "./api/kline";
import { getQuote } from "./api/quote";

export class EastmoneyClient {
  kline = getKLine;
  quote = getQuote;
}
```

---

## 9️⃣ index.ts（对外导出）

```ts
export * from "./client";
export * from "./types/kline";
```

---

# 四、使用示例（量化直接用）

```ts
import { EastmoneyClient } from "eastmoney-data-sdk";

const client = new EastmoneyClient();

const klines = await client.kline({
  secid: "1.588080",
  klt: 101,
  fqt: 1,
  limit: 500
});

console.log(klines.slice(-5));
```

---

# 五、你现在已经能做什么（实话）

✔ 自建 **A 股行情数据服务**
✔ 给量化系统 / 前端 / BI 用
✔ 封装成 **私有 npm 包**
✔ 对接 MA / 网格 / 回测系统

---

# 六、下一步我强烈建议你做的 3 件事

1️⃣ **加本地缓存（Redis / SQLite / CSV）**
2️⃣ **加错误重试 & 熔断**
3️⃣ **补齐分时 / 分钟线 / ETF 列表 API**

如果你愿意，我可以下一步直接帮你：

* 🔥 **补齐「分钟线 + 分时」API**
* 🔥 **加 MySQL / DuckDB 数据落库模块**
* 🔥 **把它升级成「量化数据微服务」**

你选一个，我继续给你把 SDK 拉满。
