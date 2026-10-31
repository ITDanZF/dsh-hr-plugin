export const panelCss = `
.hr-panel {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--dsw-alias-bg-base, #f7f7f8);
  color: var(--dsw-alias-label-primary, #1c1917);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.45;
}
[data-sidebar-right-tab]:has(.hr-panel) {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: auto;
  height: auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
[data-sidebar-right-tab]:has(.hr-panel) > * {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.hr-top, .hr-templates, .jump {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.hr-top {
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: var(--dsw-alias-bg-layer-1, #fff);
}
.hr-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.export-button {
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: transparent;
  color: var(--dsw-alias-label-primary, #1c1917);
  border-radius: 8px;
  padding: 4px 10px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.export-button:disabled { cursor: not-allowed; opacity: 0.5; }
.print-source { display: none; }
.hr-brand { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.hr-brand strong { font-size: 15px; font-weight: 650; }
.hr-brand span, .hint, .item-index { color: var(--dsw-alias-label-tertiary, #78716c); font-size: 12px; }
.hr-save-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 16px;
  color: #7c2d12;
  background: #fff7ed;
  border-bottom: 1px solid #fed7aa;
  font-size: 12px;
}
.hr-save-alert button {
  border: 1px solid currentColor;
  border-radius: 6px;
  padding: 3px 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.hr-save-alert button:hover, .hr-save-alert button:focus-visible { background: #ffedd5; }
.hr-loading { padding: 20px 16px; color: var(--dsw-alias-label-secondary, #57534e); }
.hr-switch, .hr-templates, .jump { padding: 0; }
.hr-switch { background: var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04)); border-radius: 999px; padding: 3px; }
.hr-switch button, .hr-templates button, .jump button, .text-button, .item-delete {
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary, #1c1917);
  font: inherit;
  cursor: pointer;
}
.hr-switch button, .hr-templates button, .jump button {
  border-radius: 999px;
  padding: 6px 12px;
}
.hr-switch button[aria-pressed="true"], .hr-templates button[aria-pressed="true"] {
  background: var(--dsw-static-deepseek-500, #4176e6);
  color: #fff;
}
.hr-templates, .jump {
  padding: 8px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: var(--dsw-alias-bg-layer-1, #fff);
}
.hr-templates {
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 10px;
}
.jump { position: sticky; top: 0; z-index: 2; }
.jump button { padding: 4px 8px; color: var(--dsw-alias-label-secondary, #57534e); background: transparent; border: 0; font: inherit; cursor: pointer; }
.jump button:hover, .text-button:hover, .item-delete:hover { color: var(--dsw-static-deepseek-500, #4176e6); }
.hr-body { flex: 1; min-height: 0; overflow: auto; }
.hr-body:has(.template-split) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.hr-body > [hidden] { display: none; }
.editor { display: flex; flex-direction: column; gap: 12px; padding: 12px 16px 28px; overflow-anchor: none; }
.section-accordion.ant-collapse {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent;
  border: 0;
}
.section-accordion .ant-collapse-item {
  position: relative;
  overflow: hidden;
  background: var(--dsw-alias-bg-layer-1, #fff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12)) !important;
  border-radius: 12px !important;
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}
.section-accordion .ant-collapse-header {
  align-items: center !important;
  padding: 12px 14px !important;
  transition: background-color 160ms ease;
}
.section-accordion .ant-collapse-header:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.04));
}
.section-accordion .ant-collapse-expand-icon {
  color: var(--dsw-alias-label-tertiary, #78716c);
}
.section-accordion .ant-collapse-content {
  background: transparent;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
}
.section-accordion .ant-collapse-content-box { padding: 12px 14px 14px !important; }
.section-pill {
  color: var(--dsw-alias-label-secondary, #57534e);
  background: var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04));
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.4;
  transition: color 160ms ease, background-color 160ms ease;
}
.section-pill.is-empty { color: var(--dsw-alias-label-tertiary, #a8a29e); }
.section-drag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 2px 4px;
  margin: -2px -4px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: background-color 160ms ease, color 160ms ease;
}
.section-drag:hover, .section-drag:focus-visible { background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06)); }
.section-drag:focus-visible { outline: 2px solid var(--dsw-static-deepseek-500, #4176e6); outline-offset: 2px; }
.section-grip { color: var(--dsw-alias-label-tertiary, #a8a29e); font-size: 16px; line-height: 1; }
.section-drag:active { cursor: grabbing; }
.section-header-extra, .section-actions { display: inline-flex; align-items: center; gap: 3px; }
.section-actions .ant-btn { padding-inline: 4px; color: var(--dsw-alias-label-secondary, #aaa); }
.section-actions .ant-btn.section-remove { color: #f87171; }
.section-actions .ant-btn.section-remove:hover, .section-actions .ant-btn.section-remove:focus-visible { color: #fca5a5; background: rgba(239, 68, 68, 0.12); }
.section-accordion .ant-collapse-item.section-is-dragging { opacity: 0.42; border-style: dashed !important; }
.section-accordion .ant-collapse-item.section-drop-before,
.section-accordion .ant-collapse-item.section-drop-after { overflow: visible; }
.section-accordion .ant-collapse-item.section-drop-before::before,
.section-accordion .ant-collapse-item.section-drop-after::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  height: 3px;
  border-radius: 999px;
  background: var(--dsw-static-deepseek-500, #4176e6);
  box-shadow: 0 0 0 3px rgba(65, 118, 230, 0.16);
  pointer-events: none;
  z-index: 2;
}
.section-accordion .ant-collapse-item.section-drop-before::before { top: -6px; }
.section-accordion .ant-collapse-item.section-drop-after::after { bottom: -6px; }
.section-add-panel { border: 1px dashed var(--dsw-alias-border-l2, #666); border-radius: 10px; padding: 10px 14px; transition: border-color 180ms ease, background-color 180ms ease; }
.section-add-panel:hover, .section-add-panel[open] { border-color: var(--dsw-static-deepseek-500, #4176e6); }
.section-add-panel summary { cursor: pointer; font-weight: 600; }
.section-add-options { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; animation: section-reveal 180ms ease-out both; }
.hr-panel .export-button, .hr-panel .hr-switch button, .hr-panel .hr-templates button,
.hr-panel .section-actions .ant-btn, .hr-panel .section-add-options .ant-btn {
  transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
@keyframes section-reveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .hr-panel .section-accordion .ant-collapse-item, .hr-panel .section-accordion .ant-collapse-header,
  .hr-panel .section-drag, .hr-panel .section-pill, .hr-panel .section-add-panel, .hr-panel .section-add-options,
  .hr-panel .export-button, .hr-panel .hr-switch button, .hr-panel .hr-templates button,
  .hr-panel .section-actions .ant-btn, .hr-panel .section-add-options .ant-btn,
  .hr-panel .template-split, .hr-panel .sheet, .hr-panel .sheet h2, .hr-panel .sheet a,
  .hr-panel .template-tabs button, .hr-panel .preset-card, .hr-panel .preview-page { animation: none; transition: none; }
}
.section-create { display: flex; gap: 8px; width: 100%; }
.section-create .ant-input { flex: 1; min-width: 0; }
.custom-section-body, .custom-field-editor { display: grid; gap: 8px; }
.custom-field-editor { padding: 10px 0; border-bottom: 1px solid var(--dsw-alias-border-l1, #555); }
.custom-field-output { margin: 6px 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.custom-field-output ul { margin: 4px 0 8px; padding-left: 20px; }
.section-body .block-head { justify-content: flex-end; margin-bottom: 4px; }
.block {
  background: var(--dsw-alias-bg-layer-1, #fff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 12px;
  padding: 14px;
}
.block-head, .item-head, .entry-head, .side-contact, .meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}
.block-head { align-items: center; margin-bottom: 10px; }
.block-head h2, .sheet h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
}
.fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px 12px;
}
.field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.field.wide { grid-column: 1 / -1; }
.field span { font-size: 12px; color: var(--dsw-alias-label-secondary, #57534e); }
.field .ant-input,
.field .ant-input-affix-wrapper,
.field .ant-select,
.field .ant-picker { width: 100%; }
.item {
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));
  padding-top: 12px;
  margin-top: 12px;
}
.photo-row { display: flex; align-items: center; gap: 12px; }
.photo-row img, .photo-empty {
  width: 72px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
  border: 1px dashed var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.12));
}
.photo-empty { display: grid; place-items: center; color: var(--dsw-alias-label-tertiary, #a8a29e); font-size: 12px; }
.check { margin: 8px 0 0; }
.stage { padding: 20px 12px 36px; background: var(--dsw-alias-bg-base, #f7f7f8); min-height: 100%; box-sizing: border-box; }
.sheet {
  width: min(210mm, 100%);
  min-height: 297mm;
  margin: 0 auto;
  background: var(--sheet-paper, #fff);
  color: var(--sheet-ink, #1c1917);
  box-shadow: 0 16px 40px rgba(50, 40, 20, 0.14);
  box-sizing: border-box;
  overflow-wrap: break-word;
  transition: background-color 200ms ease, color 200ms ease, box-shadow 200ms ease;
}
.sheet h2, .sheet a { transition: color 200ms ease, border-color 200ms ease; }
.sheet.density-compact { --sheet-pad: 12mm; }
.sheet.density-normal { --sheet-pad: 16mm; }
.sheet.density-relaxed { --sheet-pad: 18mm; }
.sheet.scale-small { font-size: 12.5px; }
.sheet.scale-medium { font-size: 13.5px; }
.sheet.scale-large { font-size: 15px; }
.sheet-single, .sheet-educationFirst { padding: var(--sheet-pad, 16mm); }
.font-serif { font-family: "Songti SC", "SimSun", "STSong", serif; }
.font-sans { font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
.font-mono { font-family: "Sarasa Mono SC", "Cascadia Mono", Consolas, monospace; }
.sheet h1 { margin: 0; font-size: 30px; font-weight: 650; letter-spacing: 0.06em; color: var(--sheet-ink, #1c1917); }
.sheet.scale-small h1 { font-size: 26px; }
.sheet.scale-large h1 { font-size: 36px; }
.sheet h1::after {
  content: "";
  display: block;
  width: 36px;
  height: 2px;
  margin-top: 10px;
  background: var(--sheet-accent, #1c1917);
}
.sheet.name-none h1::after { content: none; }
.sheet.align-center header { text-align: center; }
.sheet.align-center h1::after { margin-left: auto; margin-right: auto; }
.sheet.align-center .sheet-photo { margin-left: auto; margin-right: auto; }
.sheet .headline, .sheet .contact, .sheet .intention-line { margin: 8px 0 0; color: color-mix(in srgb, var(--sheet-ink, #1c1917) 68%, transparent); font-size: 13px; }
.sheet .contact a, .sheet .entry a { color: inherit; }
.sheet h2 {
  margin: 20px 0 8px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.14em;
  color: var(--sheet-ink, #1c1917);
  border-bottom: 1px solid color-mix(in srgb, var(--sheet-ink, #1c1917) 14%, transparent);
  padding-bottom: 4px;
}
.sheet.heading-accent h2 { border-bottom-color: var(--sheet-accent, #1c1917); }
.sheet.heading-none h2 { border-bottom-color: transparent; padding-bottom: 0; }
.sheet.density-compact h2 { margin-top: 12px; }
.sheet.density-relaxed h2 { margin-top: 22px; }
.sheet.date-below .entry-head { flex-direction: column; align-items: flex-start; gap: 2px; }
.sheet .entry { margin-top: 10px; }
.sheet .entry h3 { margin: 0; font-size: 14px; font-weight: 650; }
.sheet .entry p, .sheet .entry li { margin: 3px 0 0; font-size: inherit; line-height: var(--sheet-line-height, 1.55); }
.sheet .entry ul { margin: 4px 0 0; padding-left: 1.2em; }
.sheet .dates, .sheet .meta { color: color-mix(in srgb, var(--sheet-ink, #1c1917) 52%, transparent); font-size: 12px; }
.sheet .dates { flex: none; }
.sheet-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 0; }
.sheet-tags span {
  background: color-mix(in srgb, var(--sheet-ink, #1c1917) 6%, var(--sheet-paper, #fff));
  color: color-mix(in srgb, var(--sheet-ink, #1c1917) 62%, transparent);
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.sheet-sidebar {
  display: grid;
  grid-template-columns: 68mm 1fr;
  padding: 0;
}
.sheet-side {
  background: var(--sheet-accent, #1e3330);
  color: var(--sheet-paper, #fff);
  padding: var(--sheet-pad, 16mm) calc(var(--sheet-pad, 16mm) * 0.55);
}
.sheet-side h1, .sheet-side h2, .sheet-side .headline, .sheet-side .contact, .sheet-side a { color: var(--sheet-paper, #fff); }
.sheet-side h1::after { background: var(--sheet-paper, #fff); }
.sheet-side h2 {
  color: var(--sheet-paper, #fff);
  border-bottom-color: color-mix(in srgb, var(--sheet-paper, #fff) 32%, transparent);
}
.sheet.heading-accent .sheet-side h2 { border-bottom-color: color-mix(in srgb, var(--sheet-paper, #fff) 55%, transparent); }
.sheet.heading-none .sheet-side h2 { border-bottom-color: transparent; }
.sheet-side .dates, .sheet-side .meta { color: color-mix(in srgb, var(--sheet-paper, #fff) 72%, transparent); }
.sheet-side .sheet-tags span {
  background: color-mix(in srgb, var(--sheet-paper, #fff) 14%, transparent);
  color: color-mix(in srgb, var(--sheet-paper, #fff) 88%, transparent);
}
.sheet-main { padding: var(--sheet-pad, 16mm) calc(var(--sheet-pad, 16mm) * 0.8); background: var(--sheet-paper, #fff); color: var(--sheet-ink, #1c1917); }
.sheet-photo { width: 28mm; height: 36mm; object-fit: cover; border: 0; border-radius: 2px; margin-bottom: 12px; }
.sheet .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.sheet .tags span, .sheet .intention-pills span {
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 12px;
}
.sheet .intention-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; color: var(--sheet-accent, #1d4e89); }
.sheet .graduate-bar { height: 3px; background: var(--sheet-accent, #1d4e89); margin: calc(var(--sheet-pad, 16mm) * -1) calc(var(--sheet-pad, 16mm) * -1) 16mm; }
.template-split {
  animation: section-reveal 200ms ease-out both;
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  min-width: 0;
}
.template-rail {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 0 0 clamp(200px, 35%, 260px);
  min-height: 0;
  overflow: hidden;
  border-right: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: var(--dsw-alias-bg-layer-1, #fff);
}
.template-rail[hidden] { display: none; }
.template-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 16px 7px; }
.template-rail-head > div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.template-rail-head strong { font-size: 14px; }
.template-rail-head span, .template-help { font-size: 11px; color: var(--dsw-alias-label-tertiary, #78716c); }
.rail-collapse { flex: none; width: 26px; height: 26px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary, #57534e); font: inherit; font-size: 22px; line-height: 1; cursor: pointer; }
.rail-collapse:hover, .rail-collapse:focus-visible { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.06)); }
.template-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 3px 12px 7px; flex: none; }
.template-tabs button { min-width: 0; padding: 6px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary, #57534e); font: inherit; font-size: 12px; cursor: pointer; transition: background 160ms ease, color 160ms ease; }
.template-tabs button[aria-selected="true"] { color: var(--dsw-static-deepseek-500, #4176e6); background: color-mix(in srgb, var(--dsw-static-deepseek-500, #4176e6) 12%, transparent); font-weight: 650; }
.template-tabs button:hover, .template-tabs button:focus-visible { background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06)); }
.template-controls { flex: 1; min-height: 0; overflow: auto; padding: 8px 16px 14px; display: flex; flex-direction: column; gap: 12px; scrollbar-gutter: stable; }
.template-help { margin: 0; line-height: 1.5; }
.preset-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.preset-card { display: flex; align-items: center; gap: 6px; min-width: 0; padding: 6px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 8px; background: transparent; color: var(--dsw-alias-label-primary, #1c1917); font: inherit; font-size: 11px; text-align: left; cursor: pointer; transition: border-color 160ms ease, background 160ms ease, transform 160ms ease; }
.preset-card:hover { transform: translateY(-1px); }
.preset-card.is-selected { border-color: var(--dsw-static-deepseek-500, #4176e6); background: color-mix(in srgb, var(--dsw-static-deepseek-500, #4176e6) 8%, transparent); }
.preset-page { display: flex; flex: none; flex-direction: column; justify-content: flex-start; gap: 3px; width: 20px; height: 28px; padding: 5px 3px; box-sizing: border-box; border: 1px solid currentColor; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
.preset-page i { height: 2px; background: currentColor; opacity: .75; }
.preset-page i:first-child { height: 3px; }
.rail-field { display: flex; flex-direction: column; gap: 6px; }
.rail-field > span, .template-rail .photo-switch { font-size: 12px; color: var(--dsw-alias-label-secondary, #57534e); }
.template-rail .photo-switch {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.choice-row, .layout-pick, .swatch-row { display: flex; gap: 6px; }
.choice-row button, .layout-pick button {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: transparent;
  color: var(--dsw-alias-label-secondary, #57534e);
  border-radius: 8px;
  padding: 6px 4px;
  font: inherit;
  font-size: 12px;
  line-height: 1.3;
  cursor: pointer;
}
.choice-row button.is-selected, .layout-pick button.is-selected {
  color: var(--dsw-alias-label-primary, #1c1917);
  border-color: var(--dsw-alias-label-primary, #1c1917);
  background: var(--dsw-alias-bg-layer-2, rgba(0, 0, 0, 0.04));
}
.choice-row .face-serif { font-family: "Songti SC", "SimSun", "STSong", serif; }
.choice-row .face-sans { font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
.choice-row .face-mono { font-family: "Sarasa Mono SC", "Cascadia Mono", Consolas, monospace; }
.layout-pick button { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; }
.layout-glyph {
  display: block;
  width: 100%;
  height: 26px;
  border: 1px solid color-mix(in srgb, currentColor 40%, transparent);
  border-radius: 3px;
  position: relative;
}
.layout-single::before, .layout-educationFirst::before {
  content: "";
  position: absolute;
  left: 4px;
  right: 4px;
  top: 7px;
  height: 2px;
  background: currentColor;
  box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor;
}
.layout-educationFirst::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: currentColor;
}
.layout-sidebar { background: linear-gradient(90deg, currentColor 0 30%, transparent 30%); }
.swatch-row { flex-wrap: wrap; align-items: center; }
.swatch {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}
.swatch.is-selected { border-color: var(--dsw-alias-label-primary, #1c1917); }
.color-control { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.custom-color { display: inline-flex; align-items: center; gap: 5px; color: var(--dsw-alias-label-secondary, #57534e); font-size: 11px; cursor: pointer; }
.custom-color input { width: 30px; height: 28px; padding: 0; border: 0; background: transparent; cursor: pointer; }
.rail-range { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-secondary, #57534e); }
.rail-range > span { display: flex; justify-content: space-between; }
.rail-range strong { color: var(--dsw-alias-label-primary, #1c1917); }
.rail-range input { width: 100%; accent-color: var(--dsw-static-deepseek-500, #4176e6); }
.placement-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 5px; }
.placement-list > div { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; font-size: 12px; }
.placement-list > div span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.placement-list button { flex: none; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 5px; padding: 2px 7px; background: transparent; color: var(--dsw-alias-label-primary, #1c1917); font: inherit; font-size: 11px; cursor: pointer; }
.template-preview { display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; }
.template-preview-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; padding: 7px 12px; background: var(--dsw-alias-bg-layer-1, #fff); border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); font-size: 11px; color: var(--dsw-alias-label-secondary, #57534e); }
.preview-bar-start { display: flex; align-items: center; gap: 8px; }
.preview-settings-toggle { border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 6px; padding: 4px 7px; background: transparent; color: var(--dsw-alias-label-primary, #1c1917); font: inherit; font-size: 11px; cursor: pointer; }
.preview-settings-toggle:hover, .preview-settings-toggle:focus-visible { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.06)); }
.preview-zoom { display: flex; gap: 3px; }
.preview-zoom button { border: 0; border-radius: 5px; padding: 4px 7px; background: transparent; color: inherit; font: inherit; font-size: 11px; cursor: pointer; }
.preview-zoom button[aria-pressed="true"] { background: var(--dsw-alias-bg-layer-2, rgba(0,0,0,.06)); color: var(--dsw-alias-label-primary, #1c1917); font-weight: 650; }
.template-preview .stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  background: var(--dsw-alias-bg-base, #f7f7f8);
}
.preview-page { width: 794px; margin: 0 auto; transition: zoom 160ms ease; }
.template-split .sheet { margin: 0; width: 210mm; max-width: none; }
@media print {
  body.hr-printing * { visibility: hidden !important; }
  body.hr-printing .print-source,
  body.hr-printing .print-source * { visibility: visible !important; }
  body.hr-printing .print-source {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    background: white;
  }
  body.hr-printing .print-source .sheet {
    width: 210mm;
    max-width: none;
    min-height: 297mm;
    margin: 0;
    box-shadow: none;
  }
}
`
