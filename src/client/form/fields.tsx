import { DatePicker, Input, Select } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { ReactNode } from 'react'
import { linesToList, listToLines, textToTokens, tokensToText } from '../draft.js'

dayjs.locale('zh-cn')

export function Field({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}): ReactNode {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function TextField({
  label,
  value,
  onChange,
  wide,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  wide?: boolean
  placeholder?: string
}): ReactNode {
  return (
    <Field label={label} wide={wide}>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

export function MonthField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}): ReactNode {
  return (
    <Field label={label}>
      <DatePicker
        picker="month"
        placeholder="选择月份"
        value={value ? dayjs(value, 'YYYY-MM') : null}
        onChange={(date) => onChange(date ? date.format('YYYY-MM') : '')}
      />
    </Field>
  )
}

export function ChoiceField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { value: string, label: string }[]
  onChange: (value: string) => void
}): ReactNode {
  return (
    <Field label={label}>
      <Select
        allowClear
        placeholder="不填写"
        value={value || undefined}
        options={options.filter((option) => option.value).map((option) => ({ value: option.value, label: option.label }))}
        onChange={(next) => onChange(next ?? '')}
      />
    </Field>
  )
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}): ReactNode {
  return (
    <Field label={label} wide>
      <Input.TextArea
        value={value}
        placeholder={placeholder}
        autoSize={{ minRows: 3, maxRows: 8 }}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

export function LinesField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}): ReactNode {
  return (
    <AreaField
      label={label}
      value={listToLines(value)}
      placeholder={placeholder}
      onChange={(text) => onChange(linesToList(text))}
    />
  )
}

export function TokensField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}): ReactNode {
  return (
    <TextField
      label={label}
      wide
      value={tokensToText(value)}
      placeholder={placeholder}
      onChange={(text) => onChange(textToTokens(text))}
    />
  )
}
