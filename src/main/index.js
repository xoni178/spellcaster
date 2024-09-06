import { app, shell, BrowserWindow, ipcMain, dialog, protocol, Tray, Menu } from 'electron'

const fs = require('fs')

import { join, basename } from 'path'

import { optimizer, is } from '@electron-toolkit/utils'

import {
  checkUserJSONExistence,
  storeGamesDir,
  readGameDir,
  watchFolderForChanges,
  setMainWindow,
  saveExeFileName,
  readExeFileNames,
  addGameManually
} from './localData'

import { getNewsApi, libraryDirPath } from './steamApi'

import { checkAppRunning, executeGameExe, closeExternalAppWindows, eventEmiter } from './tracker'

import { achievementsImgCachePath } from './achievements'
//Must leave the browser window global so it dosent get garbage collected by javascript
let mainWindow

//tray button
let tray

// Define your custom protocol
const MY_PROTOCOL = 'my-protocol'

//------------------------------------------------------------------------------------------------------------------
protocol.registerSchemesAsPrivileged([
  { scheme: 'my-protocol', privileges: { standard: true, supportFetchAPI: true } }
])

//------------------------------------------------------------------------------------------------------------------

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1330,
    height: 955,
    // width: 200,
    // height: 225,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js')
    },
    frame: false
  })

  mainWindow.resizable = false

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'renderer/index.html'))
  }

  setMainWindow(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  protocol.interceptBufferProtocol(MY_PROTOCOL, (request, callback) => {
    const filePath = decodeURIComponent(request.url.substring(`${MY_PROTOCOL}://`.length))

    // Check if the file exists and if the app has access to it
    fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) {
        console.error(`File not found or access denied: ${filePath}`)
        callback({ statusCode: 404, headers: {} }) // Not Found
        return
      }

      try {
        // Read the file and return its contents
        const fileData = fs.readFileSync(filePath)
        callback({ mimeType: 'application/octet-stream', data: fileData })
      } catch (error) {
        console.error(`Error reading file: ${filePath}`, error)
        callback({ statusCode: 500, headers: {} }) // Internal Server Error
      }
    })
  })

  tray = new Tray(join(__dirname, '..', '..', 'resources', 'icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function () {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: function () {
        app.quit()
      }
    }
  ])

  tray.setToolTip('SpellCaster')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  IPCHandling()

  createMainWindow()

  if (!checkUserJSONExistence()) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('first-init', true)
    })
  }

  watchFolderForChanges()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const waitForImageExistence = (filePath, waitTime) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    setTimeout(function func() {
      if (Date.now() - startTime < waitTime) {
        if (fs.existsSync(filePath)) {
          resolve(true)
        } else setTimeout(func, 100)
      } else reject(false)
    }, 100)
  })
}

function IPCHandling() {
  // IPC events listeners
  ipcMain.on('close-app', () => {
    mainWindow.hide()
  })
  ipcMain.on('minimize-app', () => mainWindow.minimize())

  ipcMain.on('add-new-game', async (e, addGameData) => {
    if (!addGameData) return

    let images = {
      libraryHeader_name: `${addGameData.gameID}_library_600x900.jpg`,
      libraryHero_name: `${addGameData.gameID}_library_hero.jpg`,
      logo_name: `${addGameData.gameID}_logo.png`,
      icon_name: `${addGameData.gameID}_icon.jpg`,
      header_name: `${addGameData.gameID}_header.jpg`
    }

    let gameHeaderImgData = null
    let gameHeroImgData = null
    let gameIconImgData = null
    let gameLogoImgData = null

    if (fs.existsSync(addGameData.gameImages.gameHeaderImg.path))
      gameHeaderImgData = fs.readFileSync(addGameData.gameImages.gameHeaderImg.path)
    if (fs.existsSync(addGameData.gameImages.gameHeroImg.path))
      gameHeroImgData = fs.readFileSync(addGameData.gameImages.gameHeroImg.path)
    if (fs.existsSync(addGameData.gameImages.gameIconImg.path))
      gameIconImgData = fs.readFileSync(addGameData.gameImages.gameIconImg.path)
    if (fs.existsSync(addGameData.gameImages.gameLogoImg.path))
      gameLogoImgData = fs.readFileSync(addGameData.gameImages.gameLogoImg.path)

    if (gameHeaderImgData && !fs.existsSync(join(libraryDirPath, images.libraryHeader_name))) {
      fs.writeFileSync(join(libraryDirPath, images.libraryHeader_name), gameHeaderImgData)
    }

    if (gameHeaderImgData && !fs.existsSync(join(libraryDirPath, images.header_name))) {
      fs.writeFileSync(join(libraryDirPath, images.header_name), gameHeaderImgData)
    }

    if (gameHeroImgData && !fs.existsSync(join(libraryDirPath, images.libraryHero_name))) {
      fs.writeFileSync(join(libraryDirPath, images.libraryHero_name), gameHeroImgData)
    }

    if (gameIconImgData && !fs.existsSync(join(libraryDirPath, images.icon_name))) {
      fs.writeFileSync(join(libraryDirPath, images.icon_name), gameIconImgData)
    }

    if (gameLogoImgData && !fs.existsSync(join(libraryDirPath, images.logo_name))) {
      fs.writeFileSync(join(libraryDirPath, images.logo_name), gameLogoImgData)
    }

    addGameManually(addGameData)
  })

  ipcMain.handle('select-dir-dialouge', async () => {
    const dialogWin = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })

    if (dialogWin.canceled) {
      return
    } else {
      return dialogWin
    }
  })

  ipcMain.handle('select-exe-file', async () => {
    const dialogWin = await dialog.showOpenDialog(mainWindow, {
      defaultPath: readGameDir(),
      properties: ['openFile']
    })

    if (dialogWin.canceled) {
      return
    } else {
      // Get the file name
      const fileName = basename(dialogWin.filePaths[0])
      const filePath = dialogWin.filePaths[0]
      return { fileName, filePath }
    }
  })

  ipcMain.handle('read-selected-dir', () => {
    const data = readGameDir()

    return data
  })

  ipcMain.on('selected_directory', (e, msg) => {
    const GamesDirectoryPath = msg.pathString

    storeGamesDir(GamesDirectoryPath)
  })

  ipcMain.on('console', (e, msg) => {
    console.log(msg)
  })

  ipcMain.on('open-link', (e, data) => {
    shell.openExternal(data.url)
  })

  ipcMain.on('save-exeFileName', (e, currentExeFileName) => {
    if (currentExeFileName) {
      saveExeFileName(currentExeFileName)
      eventEmiter.emit('changed-played-time')
    }
  })

  ipcMain.on('execute-game', (e, exeFile) => {
    executeGameExe(exeFile.exeFilePath, exeFile.exeFileName)
  })

  ipcMain.on('close-game', (e, exeFileName) => {
    closeExternalAppWindows(exeFileName)
  })
  // Handle IPC request to send image data
  ipcMain.handle('request-image', async (event, filePath) => {
    try {
      const doesExist = await waitForImageExistence(filePath, 5000)

      if (doesExist) {
        const fileData = fs.readFileSync(filePath)
        if (fileData) {
          return { mimeType: 'image/jpg', data: fileData }
        }
      } else throw new Error("Image dosen't exist")
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error)
    }
  })

  ipcMain.handle('request-activity', async (e, requestInfo) => {
    try {
      const news = await getNewsApi(requestInfo.gameID, requestInfo.numberOfNews)
      if (news) {
        return news
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting activity: ', error)
    }
  })
}

//Check if game exe's are runing
setTimeout(function func() {
  const exeFileNames = readExeFileNames()
  if (exeFileNames) {
    exeFileNames.forEach((exeFileName) => {
      checkAppRunning(exeFileName)
    })
  }
  setTimeout(func, 2000)
}, 0)
