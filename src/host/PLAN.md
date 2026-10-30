# host

插件组装层。选择 SQLite 存储，注册工具和 Skill，并把当前会话文档交给浏览器。

## 职责

- 导出插件 `name` 与 `apply(ctx)`。
- 打开版本 2 的 `resume` 领域，创建 `ResumeStore`，注册任务工具、`resume_export_pdf` 和 `resume-edit` Skill。
- 每次保存同时写 JSON 镜像。
- 在 `http://127.0.0.1:3091` 提供 `GET` 和 `PUT /hr-resume/:sessionId`。保存前先按领域规则校验。

## 依赖

- 允许：`store`、`tools`、`domain`、Harness 宿主服务。
- 禁止：直接渲染浏览器 UI（那属于 `client`）。
