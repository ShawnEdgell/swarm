import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, '../preload/index.js'),
      devTools: true // Keep this true so we don't get locked out
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  // Force open DevTools on start while we are refactoring
  if (is.dev) mainWindow.webContents.openDevTools()

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  // Handle the Login Request
  ipcMain.on('start-twitch-auth', (_, data: { clientId: string }) => {
    const wins = BrowserWindow.getAllWindows()
    if (wins.length > 0) {
      const mainWindow = wins[0]

      const authWindow = new BrowserWindow({
        width: 600,
        height: 800,
        parent: mainWindow,
        modal: true,
        show: true,
        autoHideMenuBar: true
      })

      const redirectUri = 'http://localhost/callback'
      const scopes = encodeURIComponent('user:read:email chat:read chat:edit')
      // response_type=token is the key here. No nonce needed.
      const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${data.clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`

      authWindow.loadURL(authUrl)

      // Intercept the redirect
      authWindow.webContents.on('will-navigate', (event, url) => {
        if (url.startsWith(redirectUri)) {
          event.preventDefault()
          const params = new URLSearchParams(url.split('#')[1])
          const token = params.get('access_token')

          if (token) {
            mainWindow.webContents.send('twitch-token-received', token)
          }
          authWindow.close() // Focus returns to mainWindow
        }
      })
    }
  })

  createWindow()
})
