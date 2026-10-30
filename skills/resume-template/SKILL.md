---
name: resume-template
description: 调整当前会话简历的纸面样式，包括预设、版式、字体、疏密、颜色和照片显示；不改正文或导出。
---

# 调整简历纸面

先看最新 `document.appearance` 和正文规模，只使用模板类工具。用户只要方案时说明建议，不擅自写入。纸面调整不能弥补缺失事实，也不替用户改写正文。

## 选择方式

- 用户要整体换风格，优先用 `resume_apply_preset`，只传 `presetId`。默认目录的预设有 `classic-serif`（经典衬线）、`graduate`（应届清爽）、`sidebar-dark`（侧栏深色）、`mono-ink`（极简黑白）、`magazine`（杂志）、`tech-mono`（技术等宽）、`product-blue`（产品蓝）、`portfolio`（作品集）、`business-gray`（商务灰）、`academic`（学术细线）、`warm-paper`（暖色纸）、`compact-page`（紧凑一页）。若安装目录与此不同，以实际目录为准。
- 用户只要求改一个属性，就用对应的 `resume_set_*`。这些工具会把 `presetId` 标为 `custom`，其他已设属性保留。若既要预设又要局部微调，先应用预设，再逐项调整；反过来会丢掉微调。
- 以阅读效率和岗位场景选样式：应届、教育强可考虑 `graduate` 或教育优先；文字密集可考虑单栏、较紧凑的疏密；作品展示型可考虑侧栏。不要把任何预设说成保证一页、保证通过筛选或保证打印无问题。

| 属性 | 工具与参数 | 可用值 |
| --- | --- | --- |
| 版式 | `resume_set_layout` 的 `layout` | `single`、`educationFirst`、`sidebar` |
| 字体 | `resume_set_font` 的 `font` | `serif`、`sans`、`mono` |
| 疏密、字号 | `resume_set_density` 的 `density`；`resume_set_scale` 的 `scale` | `compact`、`normal`、`relaxed`；`small`、`medium`、`large` |
| 姓名对齐、下划线 | `resume_set_header_align` 的 `headerAlign`；`resume_set_name_rule` 的 `nameRule` | `left`、`center`；`short`、`none` |
| 节标题线、关键词、日期 | `resume_set_heading_rule` 的 `headingRule`；`resume_set_keyword_style` 的 `keywordStyle`；`resume_set_date_place` 的 `datePlace` | `hairline`、`accent`、`none`；`chips`、`text`；`end`、`below` |
| 照片显示 | `resume_set_show_photo` 的 `showPhoto` | `true` 或 `false` |
| 纸色、墨色、强调色 | `resume_set_paper` 的 `paper`；`resume_set_ink` 的 `ink`；`resume_set_accent` 的 `accent` | 必须是已安装目录中的色值 |

默认目录颜色：`paper` 为 `#ffffff`、`#f4f6f8`、`#faf6f0`、`#f6efe6`、`#f7f9fc`；`ink` 为 `#1c1917`、`#111111`、`#3a2418`、`#1c2430`；`accent` 为 `#1c1917`、`#1d4e89`、`#1e3330`、`#8a4b2f`、`#3f4a57`、`#3d348b`。已安装目录可能被修改；不确定色值是否在目录时，优先选预设或请用户从右侧面板确认。

每次只调用一个写入工具，并检查返回的 `ok` 和 `document.appearance`。失败时告知 `error` 并停止依赖该步骤的操作。完成后请用户在右侧模板预览和打印视图检查实际分页、对比度与照片；不要声称已亲自检查。
