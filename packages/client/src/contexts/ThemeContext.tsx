import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { themes, applyTheme, getCurrentTheme, getThemeNames } from '@config/themes'

interface ThemeContextType {
  themeName: string
  theme: any
  setTheme: (name: string) => void
  nextTheme: () => void
  availableThemes: string[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const availableThemes = getThemeNames()
  const [themeName, setThemeName] = useState<string>(getCurrentTheme())
  const [theme, setThemeObject] = useState<any>((themes as any)[themeName])

  // 初始化主题
  useEffect(() => {
    applyTheme(themeName)
  }, [])

  // 设置主题
  const setTheme = (name: string) => {
    if ((themes as any)[name]) {
      setThemeName(name)
      setThemeObject((themes as any)[name])
      applyTheme(name)
    }
  }

  // 切换到下一个主题
  const nextTheme = () => {
    const currentIndex = availableThemes.indexOf(themeName)
    const nextIndex = (currentIndex + 1) % availableThemes.length
    const nextThemeName = availableThemes[nextIndex]
    setTheme(nextThemeName)
  }

  return (
    <ThemeContext.Provider value={{ themeName, theme, setTheme, nextTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
