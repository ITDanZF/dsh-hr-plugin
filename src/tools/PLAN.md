# tools

给 DeepSeek 的可拔插任务工具。编辑、模板、导出各自一个目录，共用代码在 `shared`。每次调用都返回 JSON。

## 分类

- `guide`：优先读取。`resume_read_manual` 返回说明书，`resume_read_workflow` 返回工作流技能正文。不修改简历。
- `edit`：正文。读取、档案、十种条目、删除、排序、兴趣。
- `template`：纸面。套用预设，以及每个外观选项一个工具。
- `export`：纯文本 PDF，返回文件路径。
- `shared`：会话编号、返回 JSON、读取和保存。不注册工具。
- `index.ts`：模块名单。拿掉一项，那一类就不注册。

写成功返回整份文档。导出成功返回路径。失败返回错误说明。

## 依赖

- 允许：`domain`、`ResumeStore`、`@deepseek-ai/dsh-tools`。
- 禁止：直接选择内存或 SQLite；禁止依赖 `client`；三类工具互不引用；不读取技能文件。
