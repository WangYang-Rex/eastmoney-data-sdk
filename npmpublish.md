# NPM 发布指南

## 📦 发布前检查

| 项目 | 状态 | 说明 |
|------|------|------|
| **包名** | ✅ | `eastmoney-data-sdk` |
| **版本** | ✅ | `1.0.0` |
| **作者** | ✅ | Wang Yang |
| **入口文件** | ✅ | `dist/index.js` |
| **类型定义** | ✅ | `dist/index.d.ts` |
| **依赖** | ✅ | 仅 axios |

---

## 🚀 发布步骤

### 1. 确保已登录 npm

```bash
npm login
```

如果没有 npm 账号，先去 [npmjs.com](https://www.npmjs.com/) 注册。

### 2. 构建项目

```bash
npm run build
```

### 3. 检查将要发布的文件

```bash
npm pack --dry-run
```

### 4. 发布到 npm

```bash
npm publish
```

如果包名被占用，可以使用 scoped 包名：
```bash
# 修改 package.json 中的 name 为 @你的用户名/eastmoney-data-sdk
npm publish --access public
```

### 5. 发布后验证

```bash
npm info eastmoney-data-sdk
```

---

## 🔄 更新版本发布

### 更新补丁版本 (1.0.0 -> 1.0.1)
```bash
npm version patch
npm publish
```

### 更新次版本 (1.0.0 -> 1.1.0)
```bash
npm version minor
npm publish
```

### 更新主版本 (1.0.0 -> 2.0.0)
```bash
npm version major
npm publish
```

---

## ⚠️ 常见问题

### 1. 包名被占用
修改 `package.json` 中的 `name` 字段，或使用 scoped 包名（如 `@wangyang/eastmoney-data-sdk`）

### 2. 403 错误
- 确保已登录：`npm whoami`
- 确保邮箱已验证
- 检查包名是否与已有包太相似

### 3. 撤销发布
```bash
npm unpublish eastmoney-data-sdk@1.0.0
```
注意：发布后 72 小时内可撤销

---

## 📖 使用说明

发布成功后，用户可以通过以下方式安装：

```bash
npm install eastmoney-data-sdk
```

使用示例：
```typescript
import { EastmoneyClient } from 'eastmoney-data-sdk';

const client = new EastmoneyClient();
const klines = await client.dailyKline('1.600519', 100);
```
