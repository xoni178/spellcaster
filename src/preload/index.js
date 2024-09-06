const { contextBridge, ipcRenderer, shell } = require('electron')

const consoleLog = (msg) => {
  ipcRenderer.postMessage('console', msg)
}

// Custom APIs for renderer
const api = {
  showDialouge: function () {
    return ipcRenderer.invoke('select-dir-dialouge')
  },
  sendSelectedGamesDir: function (gamesDir) {
    ipcRenderer.postMessage('selected_directory', { pathString: gamesDir })
  },
  isFirstAppInit: function (func) {
    ipcRenderer.on('first-init', (e, msg) => {
      func(msg)
    })
  },
  getSelectGamesDir: function () {
    consoleLog('hi')
    return ipcRenderer.invoke('read-selected-dir')
  },
  getAllGamesData: function (func) {
    ipcRenderer.on('games-data', (e, msg) => {
      consoleLog('NANIII!?')
      func(msg)
    })
  },
  getLibraryCachePath: function (func) {
    ipcRenderer.on('library-cache-path', (e, msg) => {
      func(msg)
    })
  },
  getAllGamesImagesData: function (func) {
    ipcRenderer.on('get-all-games-images-data', (e, data) => {
      func(data)
    })
  },
  getImage: (callback) => {
    ipcRenderer.on('image-data', callback)
  },
  getAchievements: function (func) {
    ipcRenderer.on('get-all-achievements', (e, data) => {
      func(data)
    })
  },
  getPlayedTime: (callback) => {
    ipcRenderer.on('formated-played-time', (e, data) => {
      callback(data)
    })
  }
}

const ipc = {
  send: function (str, data = null) {
    //Send events to be listened
    ipcRenderer.send(str, data)
  },
  invoke: function (str, data = null) {
    return ipcRenderer.invoke(str, data)
  },
  openLinkToNewWindow: function (url) {
    ipcRenderer.postMessage('open-link', { url })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('ipc', ipc)
  } catch (error) {
    console.error(error)
  }
}
