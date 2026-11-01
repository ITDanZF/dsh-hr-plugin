# host

插件组装层。选择 SQLite 存储，注册工具和技能，并把当前会话文档交给浏览器。

## 职责

- 导出插件 `name` 与 `apply(ctx)`。
- 打开版本 2 的 `resume` 领域，创建带镜像的 SQLite `ResumeStore`。没有目录时写入默认目录。
- 注册说明书、正文、模板、模块和 PDF 工具。
- 注册五个技能：`resume-plan`、`resume-workflow`、`resume-edit`、`resume-template`、`resume-export`。
- 在 `http://127.0.0.1:3091` 提供会话简历的读取和保存。保存前先按领域规则校验。

## 依赖

- 允许：`store`、`tools`、`domain`、Harness 宿主服务。
- 禁止：直接渲染浏览器 UI（那属于 `client`）。
