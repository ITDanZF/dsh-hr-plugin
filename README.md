# dsh-hr-plugin

DeepSeek Harness 简历插件。一份会话对应一份完整简历草稿，写入 SQLite。右侧面板在 `src/client/`，通过 `http://127.0.0.1:3091` 读取和保存会话镜像。

启动日志应包含 `[dsh-hr-plugin] loaded` 和 `resume preview http://127.0.0.1:3091`。

本机调试使用已安装的 `dsh` 0.2.1-rc.2，不在 `deepseek-harness` 源码目录里安装依赖。日常使用单独的 `hr-dev` profile，不改默认 `web` profile。

对话工具按说明书、正文、模板和导出分组。先用 `resume_read_manual`、`resume_read_workflow` 和 `resume_read` 了解当前会话；正文、模板工具分别修改内容和纸面。`resume_export_pdf` 与面板「下载 PDF」使用同一份支持中文和自动换页的基本排版；已启用照片时会放入 PNG/JPEG 照片。面板「打印当前样式」调用浏览器打印，可保留页面布局。

面板接口默认只允许本机 Harness（3080）及面板开发服务（5174）的浏览器来源。自定义宿主来源可用逗号分隔的 `DSH_HR_ALLOWED_ORIGINS` 配置。用户编辑后自动写入当前会话，AI 工具修改时也直接写入同一份简历；页面自动读取最新版本。并发修改会保留不同字段的内容，同一字段以较晚提交的修改为准。网络中断时自动重试，未同步的内容暂存在本机浏览器，保存成功后清除；七天内可恢复。导出中文 PDF 时需要系统中有支持中文的 TTF/OTF 字体；找不到时用 `DSH_HR_PDF_FONT` 指定路径。

编辑器默认展示基本信息、摘要、工作与实习、项目、教育和技能。其他模块可在「添加模块」中启用；已有内容的旧模块在升级后仍显示。模块可拖动或用上移／下移按钮排序，顺序自动保存并用于页面预览、打印和 PDF。自定义模块支持短文本、长文本、日期区间、链接及要点列表；AI 可调用 `resume_add_section`、`resume_reorder_sections`、`resume_create_custom_section`、`resume_upsert_custom_field` 等工具执行同样操作。基本信息固定在页眉；侧栏版式可将模块放入正文或侧栏，并分别按列表顺序展示。

## 准备

全局需要 pnpm 11.7.0。`dsh plugin` 会把参数转发给它。

```sh
corepack enable
corepack prepare pnpm@11.7.0 --activate
```

在本仓库安装开发依赖并编译。`dsh` 加载的是 `dist/index.js`，不直接加载 TypeScript。

```sh
pnpm install
pnpm run build
```

一次性创建调试 profile。这条命令会按网页模板创建 `hr-dev` 并启动；确认页面能打开后停掉进程。

```sh
dsh --profile hr-dev --from-default-profile web
```

把本仓库链接进该 profile。因为 `package.json` 声明了 `dsh.bundle`，CLI 会把 `dsh-hr-plugin` 追加进 profile 的 bundle 列表。

```sh
dsh plugin --profile hr-dev add E:\workspace\dsh-hr-plugin
```

## 每次改入口之后

1. `pnpm run build`
2. `dsh --profile hr-dev --dump-config`。输出里要有 `# == dsh-hr-plugin` 层，以及 `id: hr-plugin`。没有这一层时不要先看业务代码。
3. `dsh --profile hr-dev`。启动日志里要有 `[dsh-hr-plugin] loaded`。

改插件代码必须重新编译再重启。这个加载回路不会热更新。`pnpm run dev:panel` 只预览面板，地址是 `http://127.0.0.1:5174/`，没有会话时使用示例草稿。

## 加载失败时

- `dsh plugin` 报找不到 pnpm：回到上面的 corepack 步骤。
- 装上了但 `--dump-config` 没有本包的层：`package.json` 里没有 `dsh.bundle`，或 `cordis.patch.yml` 没进 `files`。
- 有层但启动报找不到模块：还没执行 `pnpm run build`，或 `main` 不是 `dist/index.js`。
- 有层、进程起来了，但没有那行日志：`cordis.patch.yml` 的 `name` 不是包名 `dsh-hr-plugin`。
