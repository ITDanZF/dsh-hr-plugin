# domain

完整简历草稿和修改函数。不引用 Harness，也不引用本仓库其他层。

## 职责

- 定义一份简历：基本信息、链接、求职意向、摘要、经历、项目、教育、技能、语言、证书、荣誉、活动、兴趣、发表、推荐人，以及外观。
- 提供空文档。空文档使用经典外观，不放示例人物。
- 提供 `setProfile`、`upsertEntry`、`removeEntry`、`reorderEntries`、`setInterests`、`applyPreset`、`setAppearance`、`parseResume`。
- 拒绝整份覆盖。外观单项只接受侧栏里的闭集选项和现成色值。

## 依赖

- 允许：标准 TypeScript / Node 内置类型。
- 禁止：`store`、`tools`、`host`、`client`、任何 `@deepseek-ai/*` 运行时包。
