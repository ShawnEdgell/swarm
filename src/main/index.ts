import { app, BrowserWindow, ipcMain, dialog, session, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = true

let mainWindow: BrowserWindow
let overlayWindow: BrowserWindow | null = null
let isOverlayVisible = false

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

function createOverlayWindow(): void {
  try {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { height } = primaryDisplay.workAreaSize
    const overlayWidth = 400
    const overlayHeight = 600

    overlayWindow = new BrowserWindow({
      width: overlayWidth,
      height: overlayHeight,
      x: 20,
      y: height - overlayHeight - 20,
      parent: mainWindow,
      skipTaskbar: true,
      type: 'toolbar',
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      show: false,
      resizable: false,
      hasShadow: false,
      thickFrame: false,
      paintWhenInitiallyHidden: true,
      backgroundColor: '#00000000',
      webPreferences: {
        sandbox: false,
        preload: join(__dirname, '../preload/index.js'),
        devTools: true
      }
    })

    overlayWindow.setMenuBarVisibility(false)
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/overlay`)
    } else {
      overlayWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/overlay' })
    }
  } catch (error) {
    console.error('Overlay failed to initialize:', error)
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, '../preload/index.js'),
      devTools: true
    }
  })

  // F12 Shortcut
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  if (is.dev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  // Twitch CSP Fix
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders }
    if (details.url.includes('twitch.tv')) {
      delete responseHeaders['content-security-policy']
      delete responseHeaders['x-frame-options']
    }
    callback({ cancel: false, responseHeaders })
  })

  // STANDARD CLOSE LOGIC: X button kills the app
  mainWindow.on('close', () => {
    // Fire the cleanup event to Svelte
    mainWindow.webContents.send('app-closing')
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
    createOverlayWindow()
    checkUpdates()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.swarm.app')

  createWindow()

  // F8 Overlay Toggle
  globalShortcut.register('F8', () => {
    if (!overlayWindow) return
    isOverlayVisible = !isOverlayVisible
    if (isOverlayVisible) {
      overlayWindow.setOpacity(1.0)
      overlayWindow.show()
      overlayWindow.setIgnoreMouseEvents(false)
    } else {
      overlayWindow.setOpacity(0.0)
      overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    }
  })

  // Twitch Auth
  ipcMain.on('start-twitch-auth', (_, data: { clientId: string }) => {
    const authWindow = new BrowserWindow({
      width: 600,
      height: 800,
      parent: mainWindow,
      modal: true,
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
        if (token) mainWindow.webContents.send('twitch-token-received', token)
        authWindow.close()
      }
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
