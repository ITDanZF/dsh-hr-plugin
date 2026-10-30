---
name: resume-edit
description: 编辑当前会话简历的事实和正文，包括从素材整理经历、润色要点、按岗位定制、补全与纠错；不调整纸面或导出。
---

# 编辑简历正文

先读 `resume_read` 返回的 `document`；本轮工作流已读取时沿用最新结果。只使用正文类工具。用户只要建议、评分或文案草稿时先回答，不擅自保存。直接修改时尽量保留现有条目与用户未要求改动的信息。

## 写作判断

- 把用户的原始素材转成可核对的简历文字。区分“负责了什么”和“取得了什么结果”；要点优先写动作、对象、方法、结果。只在有依据时写数字、排名、增长率或因果归因，不把团队成绩写成个人独立成果。
- 按目标岗位挑选最相关的经历、项目和技能，使用用户确实做过的工作来呼应岗位要求；不把招聘条件直接抄成个人能力。摘要用一至三句概括阶段、核心能力和匹配证据，避免空泛自评。
- 工作经历和项目中同一成果不要重复铺陈。已有明确事实但表述弱，可以直接润色；任职公司、职位、时间、学校、学历、证书、业绩数值等关键事实不明时保持空白或询问，不猜测。
- 日期尽量统一到用户提供的精度，正在进行的条目可留空 `endDate`。经历通常按时间倒序；只在日期足以判断顺序时重排。技能写具体工具或方法，熟练度没有依据就用空值。
- 联系方式和推荐人信息只用用户提供的内容；未获得推荐人同意时不主动写入其电话或邮箱。不添加身份证号、详细住址等与本简历字段无关的隐私信息。

## 工具与字段

| 内容 | 工具 | 关键参数 |
| --- | --- | --- |
| 姓名、头衔、邮箱、电话、城市、照片 | `resume_set_basics` | `name`、`headline`、`email`、`phone`、`location`、`photo` |
| 个人链接 | `resume_set_links` | `links`：每项可含 `id`、`network`、`username`、`url` |
| 求职意向、摘要 | `resume_set_intention`、`resume_set_summary` | `role`、`industry`、`cities`、`workType`；`summary` |
| 工作、项目、教育 | `resume_upsert_experience`、`resume_upsert_project`、`resume_upsert_education` | 分别对应 `experiences`、`projects`、`education` |
| 技能、语言、证书、荣誉 | `resume_upsert_skill`、`resume_upsert_language`、`resume_upsert_certificate`、`resume_upsert_award` | 分别对应 `skills`、`languages`、`certificates`、`awards` |
| 活动、发表、推荐人 | `resume_upsert_activity`、`resume_upsert_publication`、`resume_upsert_reference` | 分别对应 `activities`、`publications`、`references` |
| 推荐人备索、兴趣 | `resume_set_references_flag`、`resume_set_interests` | `referencesOnRequest`；`interests` |
| 删除或排序条目 | `resume_remove_entry`、`resume_reorder_entries` | `collection`、`id`；`collection`、`ordered_ids` |

条目 `collection` 只接受 `experiences`、`projects`、`education`、`skills`、`languages`、`certificates`、`awards`、`activities`、`publications`、`references`。各 `upsert` 的具体字段名以工具参数为准，例如工作经历用 `organization`、`position`、`highlights`，项目用 `name`、`role`、`entity`、`highlights`，教育用 `school`、`degree`、`area`。

## 写入规则

- 修改现有条目必须使用最新 `document` 中对应集合的 `id`，并先确认它确实存在。省略 `id` 是新增；传入不存在的 `id` 也会新增。不要用姓名、标题或数组位置代替 `id`。
- 普通字段省略时保留原值；传空字符串可清空字符串字段。`highlights`、`keywords`、`courses` 等数组字段一旦提交，会替换该字段的整个数组。`resume_set_links` 和 `resume_set_interests` 会替换整份列表；做局部改动时先合并未改项。
- `resume_reorder_entries` 的 `ordered_ids` 必须包含该集合当前所有 `id`，每个恰好一次。删除和重排只在用户要求或实现其要求确有必要时执行。
- `workType` 只用 `''`、`全职`、`兼职`、`实习`；`level` 只用 `''`、`精通`、`熟练`、`了解`。其他字段不要编造系统不支持的选项。
- 每次只调用一个写入工具，检查返回的 `ok` 和完整 `document` 后再继续。`ok: false` 时把 `error` 告知用户并停止依赖该修改的操作。最后核对条目内容、数量与顺序，不以“工具已调用”代替核对。
