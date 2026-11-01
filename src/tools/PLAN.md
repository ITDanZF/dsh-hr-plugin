# tools

给 DeepSeek 的可拔插任务工具。说明书、正文、模板、模块和导出各自一个目录，共用代码在 `shared`。每次调用都返回 JSON。

## 分类

- `guide`：优先读取。`resume_read_manual` 返回说明书，`resume_read_workflow` 返回工作流技能正文。不修改简历。
- `edit`：正文。读取、档案、条目、删除、排序、兴趣。
- `template`：纸面。套用预设，以及每个外观选项一个工具。
- `sections`：模块。显示、隐藏、排序、侧栏位置，以及自定义模块和字段。
- `export`：PDF，返回文件路径。
- `shared`：会话编号、返回 JSON、读取和保存。不注册工具。
- `index.ts`：模块名单。拿掉一项，那一类就不注册。

写成功返回整份文档。导出成功返回路径。失败返回错误说明。

## 依赖

- 允许：`domain`、`ResumeStore`、`@deepseek-ai/dsh-tools`。
- 禁止：直接选择内存或 SQLite；禁止依赖 `client`；各类工具互不引用。
