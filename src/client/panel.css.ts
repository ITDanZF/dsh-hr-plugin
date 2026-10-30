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
.hr-actions { display: flex; align-items: center; gap: 8px; }
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
.editor { display: flex; flex-direction: column; gap: 12px; padding: 12px 16px 28px; }
.section-accordion.ant-collapse {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent;
  border: 0;
}
.section-accordion .ant-collapse-item {
  overflow: hidden;
  background: var(--dsw-alias-bg-layer-1, #fff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12)) !important;
  border-radius: 12px !important;
}
.section-accordion .ant-collapse-header {
  align-items: center !important;
  padding: 12px 14px !important;
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
}
.section-pill.is-empty { color: var(--dsw-alias-label-tertiary, #a8a29e); }
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
}
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
.sheet .entry p, .sheet .entry li { margin: 3px 0 0; font-size: inherit; line-height: 1.55; }
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
  padding: 14mm 8mm;
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
.sheet-main { padding: 14mm 12mm 16mm; background: var(--sheet-paper, #fff); color: var(--sheet-ink, #1c1917); }
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
  display: grid;
  grid-template-columns: minmax(168px, 232px) minmax(0, 1fr);
  flex: 1;
  min-height: 0;
}
.template-rail {
  width: auto;
  min-width: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 14px 14px 24px;
  border-right: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: var(--dsw-alias-bg-layer-1, #fff);
}
.rail-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 0;
}
.rail-group + .rail-group { border-top: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06)); }
.rail-label {
  margin: 0;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.14em;
  color: var(--dsw-alias-label-tertiary, #78716c);
}
.rail-field { display: flex; flex-direction: column; gap: 6px; }
.rail-field > span, .template-rail .photo-switch { font-size: 12px; color: var(--dsw-alias-label-secondary, #57534e); }
.template-rail .ant-select { width: 100%; }
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
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}
.swatch.is-selected { border-color: var(--dsw-alias-label-primary, #1c1917); }
.template-split .stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: safe center;
  padding: 16px;
  background: var(--dsw-alias-bg-base, #f7f7f8);
  container-type: inline-size;
}
.template-split .sheet { margin: 0; width: 100%; max-width: 210mm; }
@container (max-width: 640px) {
  .sheet.sheet-single, .sheet.sheet-educationFirst { padding: 16px 18px; }
  .sheet h1, .sheet.scale-small h1, .sheet.scale-large h1 { font-size: 22px; letter-spacing: 0.02em; }
  .sheet .sheet-main { padding: 16px 14px 20px; }
  .sheet .sheet-side { padding: 16px 12px; }
}
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
