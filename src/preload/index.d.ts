import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      startTwitchAuth: (clientId: string) => void
      onTwitchToken: (callback: (token: string) => void) => void
      onAppClosing: (callback: () => void) => void
    }
  }
}
