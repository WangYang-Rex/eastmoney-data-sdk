# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-19

### 🐛 Fixed

- **分时数据解析错误修复** - 修正了分时数据中 volume 和 amount 字段被错误解析的严重问题
  - 问题：API 返回 8 个字段，但代码只解析了前 5 个，导致 high/low 被当作 volume/amount
  - 影响：所有使用 `intradayTrend()` 和 `fiveDayTrend()` 的功能
  - 修复：正确解析所有 8 个字段，确保 volume 和 amount 使用正确的索引位置

- **5日分时历史数据价格为0的问题** - 修复了历史分时数据中 price 字段为 0 的问题
  - 问题：5日分时等历史数据的 price 字段返回 0，导致价格显示异常
  - 修复：当 price 为 0 时，自动使用 avgPrice 作为价格值

### 📚 Documentation

- 新增 `docs/TREND_DATA_FIX.md` - 详细的问题分析和修复文档
- 新增 `docs/API_FIELDS.md` - 完整的 API 字段映射表
- 新增 `docs/FIX_SUMMARY.md` - 修复总结和经验分享
- 更新 `README.md` - 添加数据结构说明、高级用法和调试指南

### 🧪 Tests

- 新增 `test/debug-trend.ts` - 当日分时数据调试脚本
- 新增 `test/debug-5day-trend.ts` - 5日分时数据调试脚本
- 新增 `test/full-test-report.ts` - 完整的测试验证报告
- 优化 `test/588080.ts` - 添加详细的数据输出

### 🔧 Internal

- 优化 `src/utils/parser.ts` 中的注释和文档
- 改进字段验证逻辑（从 `parts.length < 3` 改为 `parts.length < 7`）

## [1.0.0] - 2026-01-14

### ✨ Features

- **K线数据获取**
  - 支持日线、周线、月线、分钟线
  - 支持前复权、后复权、不复权
  - 支持指定日期范围查询

- **实时行情获取**
  - 获取单只股票实时行情
  - 批量获取多只股票行情
  - 包含价格、成交量、市值、PE/PB 等完整数据

- **分时数据获取**
  - 当日分时数据
  - 5日分时数据
  - 包含价格、均价、成交量、成交额等

- **股票列表获取**
  - A股列表
  - ETF列表
  - 涨幅榜
  - 跌幅榜

- **工具函数**
  - `buildSecid()` - 自动构建证券ID
  - `detectMarket()` - 自动识别市场
  - `stock()` - 快捷方法封装

### 🔧 Technical

- TypeScript 完整类型支持
- 内置请求限流机制（默认100ms间隔）
- 自动重试机制（默认重试2次）
- 详细的错误日志输出

### 📚 Documentation

- 完整的 README 文档
- TypeScript 类型定义
- 使用示例和最佳实践

---

## 版本说明

### [1.0.1] 重要修复版本
此版本修复了一个**严重的数据解析错误**，强烈建议所有用户升级。

**升级方法**:
```bash
npm update eastmoney-data-sdk
# 或
yarn upgrade eastmoney-data-sdk
```

**破坏性变更**: 无

**迁移指南**: 无需修改代码，直接升级即可

### [1.0.0] 初始版本
首次发布，提供完整的东方财富数据获取功能。

---

## 贡献指南

如果您发现了 bug 或有功能建议，欢迎：
1. 提交 [Issue](https://github.com/yourusername/eastmoney-data-sdk/issues)
2. 提交 [Pull Request](https://github.com/yourusername/eastmoney-data-sdk/pulls)

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
