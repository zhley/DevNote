import { ref } from 'vue'
import { appDataDir, appConfigDir, join } from '@tauri-apps/api/path'
import { exists, writeTextFile, readTextFile, mkdir } from '@tauri-apps/plugin-fs'
import { open, save } from '@tauri-apps/plugin-dialog'

type ProjectConfig = {
  lastProjectPath?: string
}

const CONFIG_FILE = 'config.json'
const DEFAULT_DB_NAME = 'devnote.db'

export const currentProjectPath = ref<string | null>(null)

async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (_) {
    // ignore if exists or cannot create (will fail later on writes)
  }
}

async function getConfigFilePath(): Promise<string> {
  const cfgDir = await appConfigDir()
  await ensureDir(cfgDir)
  return await join(cfgDir, CONFIG_FILE)
}

async function readConfig(): Promise<ProjectConfig> {
  try {
    const path = await getConfigFilePath()
    if (!(await exists(path))) return {}
    const content = await readTextFile(path)
    return JSON.parse(content) as ProjectConfig
  } catch {
    return {}
  }
}

async function writeConfig(cfg: ProjectConfig): Promise<void> {
  const path = await getConfigFilePath()
  await writeTextFile(path, JSON.stringify(cfg, null, 2))
}

async function createEmptyFile(filePath: string) {
  // For SQLite, an empty file is fine; it will be initialized on first connection
  await writeTextFile(filePath, '')
}

async function defaultProjectPath(): Promise<string> {
  const dataDir = await join(await appDataDir(), "projects")
  await ensureDir(dataDir)
  return await join(dataDir, DEFAULT_DB_NAME)
}

export async function initProject(): Promise<string> {
  const cfg = await readConfig()
  if (cfg.lastProjectPath && (await exists(cfg.lastProjectPath))) {
    currentProjectPath.value = cfg.lastProjectPath
    return cfg.lastProjectPath
  }
  const defPath = await defaultProjectPath()
  if (!(await exists(defPath))) {
    await createEmptyFile(defPath)
  }
  currentProjectPath.value = defPath
  await writeConfig({ lastProjectPath: defPath })
  return defPath
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
