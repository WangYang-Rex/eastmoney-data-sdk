# 版本发布指南

## 📦 当前版本

**v1.0.3** - 包含分时数据解析修复

## 🔄 版本历史

- **v1.0.3** (当前) - 分时数据解析修复 + 完整文档
- **v1.0.2** - 未知
- **v1.0.1** - 未知  
- **v1.0.0** - 初始版本

## ✅ 本次修复内容 (v1.0.3)

### 核心修复
1. ✅ 修正分时数据字段解析顺序（8字段正确解析）
2. ✅ 修复5日分时历史数据 price 为 0 的问题
3. ✅ 添加完整的数据验证逻辑

### 文档完善
1. ✅ 新增 `docs/TREND_DATA_FIX.md` - 问题分析和修复文档
2. ✅ 新增 `docs/API_FIELDS.md` - API 字段映射表
3. ✅ 新增 `docs/FIX_SUMMARY.md` - 修复总结
4. ✅ 更新 `README.md` - 数据结构说明和高级用法
5. ✅ 新增 `CHANGELOG.md` - 版本变更日志

### 测试增强
1. ✅ 新增 `test/debug-trend.ts` - 当日分时调试
2. ✅ 新增 `test/debug-5day-trend.ts` - 5日分时调试
3. ✅ 新增 `test/full-test-report.ts` - 完整测试报告
4. ✅ 优化 `test/588080.ts` - 详细数据输出

## 🧪 测试验证

运行完整测试：

```bash
npx tsx test/full-test-report.ts
```

**测试结果**：
```
✅ 通过 | 实时行情    | 数据格式正确
✅ 通过 | 当日分时    | 数据格式正确
✅ 通过 | 5日分时     | 数据格式正确，历史数据处理正确
✅ 通过 | K线数据     | 数据格式正确

总计: 4/4 测试通过
```

## 📝 发布检查清单

### 代码质量
- [x] 所有测试通过
- [x] TypeScript 编译无错误
- [x] 代码符合规范
- [x] 注释完整清晰

### 文档
- [x] README 更新
- [x] CHANGELOG 更新
- [x] API 文档完整
- [x] 示例代码可运行

### 版本管理
- [x] package.json 版本号正确 (1.0.3)
- [x] Git 提交信息清晰
- [x] 创建版本标签

## 🚀 发布步骤

### 1. 构建项目

```bash
npm run build
```

验证构建产物：
```bash
ls -la dist/
```

### 2. 本地测试

```bash
# 运行所有测试
npx tsx test/full-test-report.ts

# 运行基础测试
npx tsx test/588080.ts
```

### 3. Git 提交

```bash
# 查看修改
git status

# 添加所有修改
git add .

# 提交
git commit -m "fix: 修复分时数据解析错误 (v1.0.3)

- 修正分时数据字段解析顺序（8字段）
- 修复5日分时历史数据price为0的问题
- 完善文档和测试用例
- 添加完整的测试验证报告

Fixes #issue-number"

# 创建版本标签
git tag -a v1.0.3 -m "Release v1.0.3: 分时数据解析修复"

# 推送到远程
git push origin main
git push origin v1.0.3
```

### 4. 发布到 npm

```bash
# 登录 npm（如果未登录）
npm run npmlogin

# 发布
npm run publish
```

### 5. 验证发布

```bash
# 查看 npm 上的版本
npm view eastmoney-data-sdk version

# 在新项目中测试安装
mkdir test-install
cd test-install
npm init -y
npm install eastmoney-data-sdk
```

## 📢 发布公告

### GitHub Release

创建 GitHub Release，内容如下：

```markdown
## 🐛 Bug Fixes - v1.0.3

### 重要修复：分时数据解析错误

这是一个**重要的 Bug 修复版本**，修复了分时数据中成交量和成交额字段被错误解析的严重问题。

#### 问题描述
- 分时数据的 `volume`（成交量）和 `amount`（成交额）字段显示为价格值
- 5日分时历史数据的 `price` 字段显示为 0

#### 修复内容
1. ✅ 修正分时数据字段解析顺序（正确解析8个字段）
2. ✅ 修复5日分时历史数据 price 为 0 的问题
3. ✅ 添加完整的数据验证和测试

#### 升级建议
**强烈建议所有用户升级到此版本**

```bash
npm update eastmoney-data-sdk
```

#### 详细文档
- [修复说明](./docs/TREND_DATA_FIX.md)
- [API 字段映射](./docs/API_FIELDS.md)
- [修复总结](./docs/FIX_SUMMARY.md)

#### 测试验证
所有测试通过 (4/4) ✅

---

**Full Changelog**: https://github.com/WangYang-Rex/eastmoney-data-sdk/blob/main/CHANGELOG.md
```

## 🔍 发布后验证

### 1. npm 包验证

```bash
# 检查版本
npm view eastmoney-data-sdk version

# 检查包内容
npm view eastmoney-data-sdk

# 下载并检查
npm pack eastmoney-data-sdk
tar -xzf eastmoney-data-sdk-1.0.3.tgz
ls -la package/
```

### 2. 功能验证

创建测试项目验证功能：

```typescript
import { EastmoneyClient } from 'eastmoney-data-sdk';

const client = new EastmoneyClient();

// 测试分时数据
const trend = await client.intradayTrend('1.588080');
console.log('分时数据:', trend[0]);

// 验证 volume 和 amount 是否正确
console.assert(trend[0].volume > 1000, 'volume 应该是较大的整数');
console.assert(trend[0].amount > 10000, 'amount 应该是较大的数值');
```

## 📊 发布统计

- **修复的 Bug**: 2 个严重问题
- **新增文档**: 4 个文档文件
- **新增测试**: 3 个测试脚本
- **代码变更**: 1 个核心文件修复
- **测试通过率**: 100% (4/4)

## 🎯 下一步计划

### v1.0.4 (计划中)
- [ ] 添加更多股票测试用例
- [ ] 优化错误处理
- [ ] 添加单元测试框架

### v1.1.0 (计划中)
- [ ] 支持板块数据
- [ ] 支持指数数据
- [ ] 添加数据缓存机制

### v2.0.0 (长期)
- [ ] WebSocket 实时推送
- [ ] 可视化工具
- [ ] 性能优化

---

**发布日期**: 2026-01-19  
**发布人**: Wang Yang  
**发布状态**: ✅ 准备就绪
