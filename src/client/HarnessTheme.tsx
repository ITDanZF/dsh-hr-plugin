import { ConfigProvider, theme as antdTheme, type ConfigProviderProps, type ThemeConfig } from 'antd'
import zhCNModule from 'antd/locale/zh_CN.js'
import { useEffect, useState, type ReactNode } from 'react'

function harnessMounted(): boolean {
  return document.querySelector('[data-sidebar-right-panel], [data-sidebar-right-tab]') != null
}

function readDark(): boolean {
  if (document.body.hasAttribute('data-ds-dark-theme')) return true
  if (harnessMounted()) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function pick(name: string, fallback: string): string {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim()
  return value || fallback
}

function buildTheme(dark: boolean): ThemeConfig {
  const light = {
    text: '#1c1917',
    textSecondary: '#57534e',
    textTertiary: '#a8a29e',
    border: 'rgba(0, 0, 0, 0.12)',
    bg: '#f7f7f8',
    container: '#ffffff',
    elevated: '#ffffff',
  }
  const night = {
    text: '#f3f4f6',
    textSecondary: '#c4c6ce',
    textTertiary: '#8b8e98',
    border: 'rgba(255, 255, 255, 0.14)',
    bg: '#141416',
    container: '#1c1d21',
    elevated: '#26272c',
  }
  const palette = dark ? night : light
  return {
    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: pick('--dsw-static-deepseek-500', '#4176e6'),
      colorInfo: pick('--dsw-static-deepseek-500', '#4176e6'),
      colorText: pick('--dsw-alias-label-primary', palette.text),
      colorTextSecondary: pick('--dsw-alias-label-secondary', palette.textSecondary),
      colorTextTertiary: pick('--dsw-alias-label-tertiary', palette.textTertiary),
      colorBorder: pick('--dsw-alias-border-l2', palette.border),
      colorBorderSecondary: pick('--dsw-alias-border-l1', palette.border),
      colorBgBase: pick('--dsw-alias-bg-base', palette.bg),
      colorBgContainer: pick('--dsw-alias-bg-layer-1', palette.container),
      colorBgElevated: pick('--dsw-alias-bg-layer-2', palette.elevated),
      colorBgLayout: pick('--dsw-alias-bg-base', palette.bg),
      colorError: pick('--dsw-alias-state-error-primary', '#dc2626'),
      borderRadius: 10,
      fontFamily: 'inherit',
      controlHeight: 36,
    },
  }
}

export function HarnessTheme({ children }: { children: ReactNode }): ReactNode {
  const [dark, setDark] = useState(readDark)
  const [theme, setTheme] = useState<ThemeConfig>(() => buildTheme(readDark()))

  useEffect(() => {
    const sync = () => {
      const next = readDark()
      setDark(next)
      setTheme(buildTheme(next))
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', sync)
    }
  }, [])

  return (
    <ConfigProvider locale={zhCNModule as unknown as NonNullable<ConfigProviderProps['locale']>} theme={theme}>
      <div className={dark ? 'hr-theme hr-theme-dark' : 'hr-theme'} style={{ display: 'contents' }}>
        {children}
      </div>
    </ConfigProvider>
  )
}
