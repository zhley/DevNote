import { appConfigDir, join } from '@tauri-apps/api/path'
import { exists, writeTextFile, readTextFile, mkdir } from '@tauri-apps/plugin-fs'
import { Command } from '@tauri-apps/plugin-shell'

const SETTINGS_FILE = 'settings.json'

type Settings = {
  shortcuts?: {
    quickCreate?: string
  }
}

const defaultSettings: Settings = {
  shortcuts: {
    quickCreate: 'Alt+`'
  }
}

async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    console.error('Failed to create directory:', dirPath, error)
  }
}

async function getSettingsFilePath(): Promise<string> {
  try {
    const cfgDir = await appConfigDir()
    await ensureDir(cfgDir)
    const settingsPath = await join(cfgDir, SETTINGS_FILE)
    return settingsPath
  } catch (error) {
    console.error('Failed to get settings file path:', error)
    throw error
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const path = await getSettingsFilePath()
    
    if (!(await exists(path))) {
      // 如果文件不存在，创建默认设置文件
      await saveSettingsToFile(defaultSettings)
      return defaultSettings
    }
    
    const content = await readTextFile(path)
    const settings = JSON.parse(content) as Settings
    
    // 合并默认设置，确保所有字段都存在
    return { ...defaultSettings, ...settings }
  } catch (error) {
    console.error('Failed to load settings:', error)
    return defaultSettings
  }
}

export async function saveSettingsToFile(settings: Settings): Promise<void> {
  try {
    const path = await getSettingsFilePath()
    await writeTextFile(path, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw error
  }
}

export async function openSettingsFileInSystem(): Promise<void> {
  try {
    const path = await getSettingsFilePath()
    
    // 确保文件存在
    if (!(await exists(path))) {
      await saveSettingsToFile(defaultSettings)
    }
    
    // 在系统默认编辑器中打开文件
    const command = Command.create('open-file', [path])
    await command.execute()
  } catch (error) {
    console.error('Failed to open settings file:', error)
    throw error
  }
}