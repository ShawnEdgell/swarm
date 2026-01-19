import { app, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'

// Configure updater logging
autoUpdater.autoDownload = true
autoUpdater.logger = require('electron-log')

function checkUpdates(): void {
  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version of The Swarm has been downloaded. Restart to apply?',
        buttons: ['Restart', 'Later'],
        defaultId: 0
      })
      .then((result) => {
        if (result.response === 0) autoUpdater.quitAndInstall()
      })
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, '../preload/index.js'),
      devTools: true // Ensures the feature is enabled
    }
  })

  // --- 1. FORCE DEVTOOLS OPEN (DETACHED) ---
  // We move this here so it opens BEFORE the URL loads.
  // Using 'detach' prevents the console from freezing if the renderer crashes.
  if (is.dev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  // --- TWITCH CHAT FIX: STRIP SECURITY HEADERS ---
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.includes('twitch.tv')) {
      const responseHeaders = { ...details.responseHeaders }
      delete responseHeaders['content-security-policy']
      delete responseHeaders['x-frame-options']
      callback({ cancel: false, responseHeaders })
      return
    }
    callback({ cancel: false, responseHeaders: details.responseHeaders })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    checkUpdates()
  })

  // --- FORCE OFFLINE ON CLOSE ---
  mainWindow.on('close', () => {
    // We use a try-catch here just in case the webContents are already destroyed
    try {
      mainWindow.webContents.send('app-closing')
    } catch (e) {
      console.error('Failed to send closing signal', e)
    }
  })

  // --- LOAD THE APP ---
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.swarm.app')

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
      const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${data.clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`

      authWindow.loadURL(authUrl)

      authWindow.webContents.on('will-navigate', (event, url) => {
        if (url.startsWith(redirectUri)) {
          event.preventDefault()
          const params = new URLSearchParams(url.split('#')[1])
          const token = params.get('access_token')
          if (token) {
            mainWindow.webContents.send('twitch-token-received', token)
          }
          authWindow.close()
        }
      })
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
