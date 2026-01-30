# 📊 期权垂直价差计算器

一个简洁的移动端友好网页应用，用于计算 Credit Spread（信用价差）策略的止盈止损目标价。

## 功能

- 输入卖出价和买入价，自动计算净收入
- 自定义止盈止损比例（默认 75% / 200%）
- 实时计算止盈止损目标价差
- 估算单腿目标价格
- 移动端优化的深色主题界面

## 部署到 GitHub Pages

### 方法一：直接推送到 GitHub

```bash
# 1. 在 GitHub 上创建新仓库 options-calculator

# 2. 初始化本地仓库
cd /Users/data/jd/options-calculator
git init
git add .
git commit -m "Initial commit: Options calculator"

# 3. 推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/options-calculator.git
git branch -M main
git push -u origin main

# 4. 在 GitHub 仓库设置中启用 Pages
# Settings -> Pages -> Source: Deploy from a branch -> Branch: main -> Folder: / (root)
```

### 方法二：使用 GitHub CLI

```bash
gh repo create options-calculator --public --source=. --remote=origin --push
```

然后在 GitHub 上启用 Pages。

## 部署后访问

部署成功后，可以通过以下地址访问：
```
https://YOUR_USERNAME.github.io/options-calculator/
```

## 其他托管选项

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
直接拖拽整个文件夹到 [Netlify Drop](https://app.netlify.com/drop)

### Cloudflare Pages
连接 GitHub 仓库，自动部署。

## 使用方法

1. 输入卖出期权价格（Short Leg）
2. 输入买入期权价格（Long Leg）
3. 调整止盈止损比例（可选）
4. 查看计算结果，在富途 APP 中设置相应价格

## 示例

- 卖出价: $0.67
- 买入价: $0.17
- 净收入: $0.50
- 止盈 75% → 价差降至 $0.125 时平仓
- 止损 200% → 价差升至 $1.50 时平仓

## License

MIT
