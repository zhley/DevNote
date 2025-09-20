import { ref } from 'vue'
import { appDataDir, appConfigDir, join } from '@tauri-apps/api/path'
import { exists, writeTextFile, readTextFile, mkdir } from '@tauri-apps/plugin-fs'
import { open, save } from '@tauri-apps/plugin-dialog'

type ProjectConfig = {
  lastProjectPath?: string
}

const CONFIG_FILE = 'config.json'
const DEFAULT_DB_NAME = 'default.db'

export const currentProjectPath = ref<string | null>(null)

async function ensureDir(dirPath: string) {
  try {
    console.log('Creating directory:', dirPath)
    await mkdir(dirPath, { recursive: true })
    console.log('Directory created successfully:', dirPath)
  } catch (error) {
    console.error('Failed to create directory:', dirPath, error)
    // 不抛出错误，让后续文件写入失败时再处理
  }
}

async function getConfigFilePath(): Promise<string> {
  try {
    const cfgDir = await appConfigDir()
    console.log('App config dir:', cfgDir)
    await ensureDir(cfgDir)
    const configPath = await join(cfgDir, CONFIG_FILE)
    console.log('Config file path:', configPath)
    return configPath
  } catch (error) {
    console.error('Failed to get config file path:', error)
    throw error
  }
}

async function readConfig(): Promise<ProjectConfig> {
  try {
    console.log('Reading config...')
    const path = await getConfigFilePath()
    
    if (!(await exists(path))) {
      console.log('Config file does not exist:', path)
      return {}
    }
    
    console.log('Reading config from:', path)
    const content = await readTextFile(path)
    const config = JSON.parse(content) as ProjectConfig
    console.log('Config loaded:', config)
    return config
  } catch (error) {
    console.error('Failed to read config:', error)
    return {}
  }
}

async function writeConfig(cfg: ProjectConfig): Promise<void> {
  try {
    console.log('Writing config:', cfg)
    const path = await getConfigFilePath()
    await writeTextFile(path, JSON.stringify(cfg, null, 2))
    console.log('Config written successfully to:', path)
  } catch (error) {
    console.error('Failed to write config:', error)
    throw error
  }
}

async function createEmptyFile(filePath: string) {
  try {
    console.log('Creating empty file:', filePath)
    // For SQLite, an empty file is fine; it will be initialized on first connection
    await writeTextFile(filePath, '')
    console.log('Empty file created successfully:', filePath)
  } catch (error) {
    console.error('Failed to create empty file:', filePath, error)
    throw error
  }
}

async function defaultProjectPath(): Promise<string> {
  try {
    console.log('Getting default project path...')
    const appData = await appDataDir()
    console.log('App data dir:', appData)
    
    const dataDir = await join(appData, "projects")
    console.log('Projects dir:', dataDir)
    
    await ensureDir(dataDir)
    
    const defaultPath = await join(dataDir, DEFAULT_DB_NAME)
    console.log('Default project path:', defaultPath)
    
    return defaultPath
  } catch (error) {
    console.error('Failed to get default project path:', error)
    throw error
  }
}

export async function initProject(): Promise<string> {
  try {
    console.log('=== Starting project initialization ===')
    
    // 测试Tauri API是否正常工作
    try {
      const appData = await appDataDir()
      console.log('✓ Tauri API working, app data dir:', appData)
    } catch (error) {
      console.error('✗ Tauri API not working:', error)
      throw new Error('Tauri API not available. Make sure the app is running in Tauri context.')
    }
    
    const cfg = await readConfig()
    console.log('Read config:', cfg)
    
    if (cfg.lastProjectPath && (await exists(cfg.lastProjectPath))) {
      console.log('Using existing project path:', cfg.lastProjectPath)
      currentProjectPath.value = cfg.lastProjectPath
      return cfg.lastProjectPath
    }
    
    console.log('Creating new default project...')
    const defPath = await defaultProjectPath()
    console.log('Default project path:', defPath)
    
    if (!(await exists(defPath))) {
      console.log('Creating new project file:', defPath)
      await createEmptyFile(defPath)
    } else {
      console.log('Default project file already exists:', defPath)
    }
    
    currentProjectPath.value = defPath
    await writeConfig({ lastProjectPath: defPath })
    console.log('=== Project initialized successfully ===', defPath)
    return defPath
  } catch (error) {
    console.error('=== Project initialization failed ===', error)
    throw error
  }
}

export async function newProject(): Promise<string | null> {
  const dir = await appDataDir()
  const suggested = await join(dir, DEFAULT_DB_NAME)
  const file = await save({
    title: '新建项目文件',
    defaultPath: suggested,
    filters: [{ name: 'DevNote Project', extensions: ['db', 'sqlite'] }]
  })
  if (!file) return null
  let filePath = file as string
  if (!/\.(db|sqlite)$/i.test(filePath)) {
    filePath = filePath + '.db'
  }
  await createEmptyFile(filePath)
  currentProjectPath.value = filePath
  await writeConfig({ lastProjectPath: filePath })
  return filePath
}

export async function openProject(): Promise<string | null> {
  const selection = await open({
    title: '打开项目文件',
    multiple: false,
    directory: false,
    filters: [{ name: 'DevNote Project', extensions: ['db', 'sqlite'] }]
  })
  if (!selection || Array.isArray(selection)) return null
  const filePath = selection as string
  if (!(await exists(filePath))) return null
  currentProjectPath.value = filePath
  await writeConfig({ lastProjectPath: filePath })
  return filePath
}

export function getCurrentProjectPath(): string | null {
  return currentProjectPath.value
}
