import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Expose a clean way for the renderer to listen for the token
  onTwitchToken: (callback: (token: string) => void) =>
    ipcRenderer.on('twitch-token-received', (_event, token) => callback(token)),

  // NEW: Listen for the app-closing signal from the Main process
  onAppClosing: (callback: () => void) => ipcRenderer.on('app-closing', () => callback())
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
