import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // 1. Missing: Allow Renderer to start auth
  startTwitchAuth: (clientId: string) => ipcRenderer.send('start-twitch-auth', clientId),

  // 2. Existing: Listen for token
  onTwitchToken: (callback: (token: string) => void) =>
    ipcRenderer.on('twitch-token-received', (_event, token) => callback(token)),

  // 3. Existing: Listen for app closing
  onAppClosing: (callback: () => void) => ipcRenderer.on('app-closing', () => callback()),

  // 4. THE MISSING PIECE: Listen for F8 Toggle
  // 👇 Without this line, F8 does nothing 👇
  onToggleHud: (callback: () => void) => ipcRenderer.on('toggle-hud', () => callback())
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
