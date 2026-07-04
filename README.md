# HTools

HTools 是一款部署在 Cloudflare Pages Functions + D1 上的开源工具导航站。它适合用来搭建自己的工具库、文章页和内容流聚合后台，支持工具管理、文章发布、RSS / Atom 内容源同步、GitHub 提交 Issue、GitHub 仓库信息补全、分类管理、站点设置、备份恢复和公开订阅源。

[English Document](README_EN.md)

## 演示截图

![HTools 前台工具库](public/demo/frontend-tools.png)

![HTools 后台工具库](public/demo/admin-tools.png)

## 功能

- 前台工具库：首页、工具分类、文章、提交工具、关于页面。
- 后台管理：工具、文章、内容流、分类、系统设置集中管理。
- 内容流：支持 RSS / Atom 订阅，同步后可临时浏览或转为站内文章。
- Markdown：文章正文和关于页面支持 Markdown。
- GitHub 能力：公开用户可通过 GitHub 登录提交工具，后台添加工具时可自动读取仓库名称、简介、封面、标签、Star、Fork、协议等信息。
- 分类管理：工具、文章、内容流分类可预建、筛选、删除，也可批量处理分类内容。
- 数据能力：完整备份 / 恢复、默认工具订阅源、公开站点源 `/api/htools.json`。
- SEO 输出：`/sitemap.xml`、`/rss.xml`、`/rss.json`。
- 双语界面：简体中文和英文。

## 部署

1. Fork 或导入本仓库到你的 GitHub。
2. 在 Cloudflare Pages 新建项目，并连接你的仓库。
3. Pages 构建设置填写：

```txt
构建命令：npm run build
构建输出目录：dist
```

4. 在 Cloudflare D1 新建数据库，例如 `htools`。
5. 回到 Pages 项目设置，给 Functions 添加 D1 绑定：

```txt
变量名称：DB
D1 数据库：选择你刚创建的数据库
```

6. 在 Pages 环境变量中添加后台密码：

```txt
ADMIN_PASSWORD=你的后台密码
```

后台密码当前只要求非空，支持中文、英文、数字和常见符号，项目没有强制最短或最长长度；建议使用至少 12 位且独立的强密码。

7. 重新部署 Pages 项目。
8. 打开 `/admin` 登录后台。

应用会在首次访问 API 时自动初始化 D1 表结构。D1 默认是空的，项目不会在部署时自动写入默认工具数据；你可以在后台导入默认订阅源，也可以手动添加工具。

## 本地开发

```bash
npm install
npm run dev
```

需要本地测试 Pages Functions 和 D1 时：

```bash
copy .dev.vars.example .dev.vars
copy wrangler.local.example.toml wrangler.local.toml
```

填写 `wrangler.local.toml` 中的 `account_id`、`database_name`、`database_id`，然后启动本地 Pages Functions：

```bash
npm run pages:dev
```

如需手动初始化或排查 D1：

```bash
npm run db:init:local
npm run db:init:remote
```

## 后台设置

- `/admin`：后台入口。
- 系统设置：站点名称、站点图标、关于页面 Markdown、页脚、GitHub 提交、代理访问、备份恢复、管理员密码。
- GitHub 提交设置：配置 OAuth App 和目标仓库后，用户通过 `/submit` 提交的工具会创建为 GitHub Issue。
- GitHub 仓库信息：后台添加或编辑工具时，填写 GitHub 仓库地址后可读取仓库元数据。

GitHub OAuth App 的 Authorization callback URL：

```txt
https://你的域名/api/github/callback
```

## 数据源

- 默认工具源文件：`public/htools.json`
- 默认工具源访问地址：`https://raw.githubusercontent.com/shaoyouvip/htools/refs/heads/main/public/htools.json`
- 当前站点公开源：`/api/htools.json`

默认工具源只是在线订阅源，不会自动写入 D1。管理员可以在后台导入它，也可以导入其他站点公开的 `/api/htools.json`。默认地址指向 HTools 主仓库，方便未同步更新项目代码的站点导入最新工具数据。

## SEO 和订阅

- `/sitemap.xml`：公开页面和已发布文章的站点地图。
- `/rss.xml`：已发布文章的 RSS。
- `/rss.json`：已发布文章的 JSON Feed。

## 安全建议

- 请在 Cloudflare Pages 的环境变量中配置后台密码和 GitHub OAuth Client Secret，不要把它们写入公开代码。
- 建议为后台设置一个足够长且独立的管理员密码，并定期更新。
- 开启 GitHub 提交功能前，请确认目标仓库允许创建 Issue。
- 大版本更新、迁移站点或批量导入前，建议先在后台导出完整备份。

## 版本

当前版本：`HTools v1.0.5`
