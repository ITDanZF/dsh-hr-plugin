# store

按会话 id 读取和保存整份简历草稿。

## 职责

- 导出 `ResumeStore` 接口：`get(sessionId)`、`put(sessionId, document)`。
- 宿主使用 SQLite 实现。领域规格版本是 2，表是 `documents`。
- 内存实现留给测试。换实现时 `tools` 文件不动。

## 依赖

- 允许：`domain` 的文档类型。
- 禁止：`tools`、`host`、`client`。SQLite 实现可以依赖 Harness 的 storage domain API。
