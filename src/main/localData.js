const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const _ = require('lodash')

import { getGameDataFromApi, getGameName, libraryDirPath, allGamesImages } from './steamApi'
import {
  getAchievements,
  watchForAchievedAchievementsFileChanges,
  changedAchievementsData,
  setChangedAchievementsData,
  allAchievementsData
} from './achievements'
import { sendNotification } from './notification'
import { eventEmiter } from './tracker'

import { app } from 'electron'

const userDataFilePath = path.join(app.getPath('userData'), 'user-settings.json')
const gamesDbPath = path.join(app.getPath('userData'), 'games-db.json')

//Stores the current games directory path, where the user sets
let currentGamesDir

//Stores the games info/object that we get from chokidar, when it checks if a new game folder was added in games directory
let currentGamesInfo = []

//Stores the apps state if a new game was added and needs to be stored
let beginCount = false

//Stores the mainWindows object funcionalities which we get from index.js
let mainWindow

//Stores the apps state
let isItFirstSendSavedGamesDataToRenderer = true

let sentAchievementsData = false

const readCurrentGamesDir = () => {
  try {
    if (fs.existsSync(userDataFilePath)) {
      const data = JSON.parse(fs.readFileSync(userDataFilePath, { encoding: 'utf-8' }))
      currentGamesDir = data?.gameDir
    }
  } catch (err) {
    console.error(err)
  }
}

//Checks user-settings.json existence
const checkUserJSONExistence = () => {
  return fs.existsSync(userDataFilePath)
}

//Stores the new game folder, where the games are installed
const storeGamesDir = (path) => {
  const data = {
    gameDir: path
  }

  currentGamesDir = data?.gameDir
  try {
    fs.writeFileSync(userDataFilePath, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

//Reads sync the user-settings.json file
const readGameDir = () => {
  let readValue = ''

  try {
    if (fs.existsSync(userDataFilePath)) {
      const data = JSON.parse(fs.readFileSync(userDataFilePath, { encoding: 'utf-8' }))
      readValue = data?.gameDir

      currentGamesDir = data?.gameDir
    }
  } catch (err) {
    console.error(err)
  }

  return readValue
}

// Function to wait until currentGamesDir is defined
const getCurrentGamesDir = new Promise((resolve, reject) => {
  const checkDirInterval = setInterval(() => {
    if (currentGamesDir != '' && currentGamesDir != undefined) {
      clearInterval(checkDirInterval)
      resolve(currentGamesDir)
    }
  }, 100) // Check every 100ms
})

//Checks all the installed games in games folder/directory
const getInstalledGameID = async (folderPath) => {
  try {
    let gameInfo = {}

    const files = fs.readdirSync(folderPath)

    files.forEach((file) => {
      if (file === 'steam_settings') {
        getAchievements(path.join(folderPath, file))
        watchForAchievedAchievementsFileChanges(path.join(folderPath, file))
      }
      if (file === 'steam_appid.txt') {
        const data = fs.readFileSync(path.join(folderPath, file), { encoding: 'utf-8' })

        gameInfo = {
          gameFolderPath: folderPath,
          gameID: data
        }
      }
    })

    gameInfo.gameName = await getGameName(gameInfo.gameID)

    return gameInfo
  } catch (err) {
    console.error(err)
  }
}

const watchFolderForChanges = async () => {
  const gameDir = await getCurrentGamesDir

  var watcher = chokidar.watch(gameDir, {
    depth: 0,
    persistent: true,
    awaitWriteFinish: true
  })

  watcher
    .on('addDir', (folderPath) => {
      if (folderPath === gameDir) return
      ;(async () => {
        const gameInfo = await getInstalledGameID(folderPath)

        if (gameInfo.gameID != undefined) {
          currentGamesInfo.push(gameInfo)
        }

        if (!beginCount) beginCount = true
      })()
    })
    .on('error', (error) => console.error('Error happened', error))
}

const saveLocalGameIds = () => {
  if (fs.existsSync(gamesDbPath)) {
    const rawData = fs.readFileSync(gamesDbPath, { encoding: 'utf-8' })
    let data = JSON.parse(rawData)

    const newGamesInfo = currentGamesInfo.filter(
      (currentGameInfo) =>
        !data.some((savedGameInfo) => savedGameInfo.gameID === currentGameInfo.gameID)
    )

    if (newGamesInfo.length != 0) {
      const gameInfoToSave = [...data, ...newGamesInfo]

      fs.writeFileSync(gamesDbPath, JSON.stringify(gameInfoToSave))

      getGameDataFromApi(gameInfoToSave)
    } else {
      getGameDataFromApi(data)
    }
  } else {
    fs.writeFileSync(gamesDbPath, JSON.stringify(currentGamesInfo))

    getGameDataFromApi(currentGamesInfo)
  }
}

function sendSavedGamesDataToRenderer() {
  let data
  if (fs.existsSync(gamesDbPath)) {
    const rawData = fs.readFileSync(gamesDbPath, { encoding: 'utf-8' })
    data = JSON.parse(rawData)
  }

  if (mainWindow) {
    if (isItFirstSendSavedGamesDataToRenderer) {
      // mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('games-data', data)
      mainWindow.webContents.send('library-cache-path', libraryDirPath)
      mainWindow.webContents.send('get-all-games-images-data', allGamesImages)
      // })
    } else {
      mainWindow.webContents.send('games-data', data)
      mainWindow.webContents.send('get-all-games-images-data', allGamesImages)
    }
    isItFirstSendSavedGamesDataToRenderer = false
  } else {
    console.error('Main window is not set.')
  }
}

function setMainWindow(window) {
  mainWindow = window
}

function onAllAchievementsDataUpdate(newValue) {
  let justUnlockedAchievements = []
  const achievementsData = newValue

  mainWindow.webContents.send('get-all-achievements', achievementsData)

  const gameIds = achievementsData.flatMap((gameAchievements) => {
    return Object.keys(gameAchievements)
  })

  const nowInSeconds = Math.floor(Date.now() / 1000)
  gameIds.forEach((gameid) => {
    achievementsData.forEach((gameAchievements) => {
      justUnlockedAchievements = gameAchievements[gameid].filter(
        (achievement) =>
          achievement?.achieved_time <= nowInSeconds &&
          achievement?.achieved_time >= nowInSeconds - 10
      )
    })
  })

  if (justUnlockedAchievements.length !== 0) {
    justUnlockedAchievements.forEach((achievement) => {
      sendNotification(achievement)
    })
  }

  setChangedAchievementsData(false)
}

const sendAllAchievementsDataToRenderer = () => {
  //If its first time getting achievements data
  if (!changedAchievementsData) {
    allAchievementsData.on('update', (newValue) => {
      const achievementsData = newValue

      if (!achievementsData) return

      // mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('get-all-achievements', achievementsData)
      // })
    })
  } else {
    allAchievementsData.on('update', onAllAchievementsDataUpdate)
  }
}

const saveExeFileName = (currentExeFileName) => {
  const exeFileNamesPath = path.join(app.getPath('userData'), 'exeFileNamesPaths.json')
  let dataToSave = []

  if (fs.existsSync(exeFileNamesPath)) {
    const rawSavedExeFileNames = fs.readFileSync(exeFileNamesPath, { encoding: 'utf-8' })
    const savedExeFileNames = JSON.parse(rawSavedExeFileNames)
    const isSaved = savedExeFileNames.find(
      (savedExeFileName) => Object.keys(savedExeFileName)[0] === Object.keys(currentExeFileName)[0]
    )

    if (!isSaved) {
      dataToSave = [...savedExeFileNames, currentExeFileName]
      fs.writeFileSync(exeFileNamesPath, JSON.stringify(dataToSave))
    }
    console.log(isSaved, dataToSave)
  } else {
    dataToSave = [currentExeFileName]
    fs.writeFileSync(exeFileNamesPath, JSON.stringify(dataToSave))
  }
}

const saveGamePlayedTime = (currentPlayedTime) => {
  const exeFileNamesPath = path.join(app.getPath('userData'), 'exeFileNamesPaths.json')
  let dataToSave = []

  const rawSavedExeFileNames = fs.readFileSync(exeFileNamesPath, { encoding: 'utf-8' })
  const savedExeFileNames = JSON.parse(rawSavedExeFileNames)

  const OtherPlayedTime = savedExeFileNames.filter(
    (savedExeFileName) => Object.keys(savedExeFileName)[0] !== Object.keys(currentPlayedTime)[0]
  )

  console.log(OtherPlayedTime)

  dataToSave = [...OtherPlayedTime, currentPlayedTime]
  fs.writeFileSync(exeFileNamesPath, JSON.stringify(dataToSave))
}

const readExeFileNames = () => {
  const exeFileNamesPath = path.join(app.getPath('userData'), 'exeFileNamesPaths.json')
  if (fs.existsSync(exeFileNamesPath)) {
    const rawSavedExeFileNames = fs.readFileSync(exeFileNamesPath, { encoding: 'utf-8' })
    const savedExeFileNames = JSON.parse(rawSavedExeFileNames)

    return savedExeFileNames
  }
}

const sendPlayedTimeToRenderer = () => {
  const savedExeFileNames = readExeFileNames()
  if (mainWindow) {
    mainWindow.webContents.on('did-finish-load', () => {
      console.log(savedExeFileNames)
      mainWindow.webContents.send('formated-played-time', savedExeFileNames)
    })

    eventEmiter.on('changed-played-time', () => {
      const savedExeFileNames = readExeFileNames()
      mainWindow.webContents.send('formated-played-time', savedExeFileNames)
    })
  }
}

const addGameManually = (gameToAdd) => {
  if (!gameToAdd) return

  if (fs.existsSync(gamesDbPath)) {
    const rawData = fs.readFileSync(gamesDbPath, { encoding: 'utf-8' })
    let data = JSON.parse(rawData)

    const isNew = data.filter((currentGameInfo) => currentGameInfo.gameID !== gameToAdd.gameID)

    if (isNew) {
      const obj = {
        gameFolderPath: gameToAdd.gameFolderPath,
        gameID: gameToAdd.gameID,
        gameName: gameToAdd.gameName
      }
      const gameInfoToSave = [...data, obj]

      fs.writeFileSync(gamesDbPath, JSON.stringify(gameInfoToSave))

      getGameDataFromApi(gameInfoToSave)

      sendSavedGamesDataToRenderer()
    }
  }
}

// Function to always check beiginCount state

setTimeout(function func() {
  if (beginCount == true) {
    saveLocalGameIds()
    sendSavedGamesDataToRenderer()
    beginCount = false
  }
  if (changedAchievementsData && !sentAchievementsData) {
    sendAllAchievementsDataToRenderer()
    sentAchievementsData = true
  } else {
    // Check if the listener is active and remove it if it is
    const listeners = allAchievementsData.listeners('update')
    if (listeners.includes(onAllAchievementsDataUpdate)) {
      allAchievementsData.removeListener('update', onAllAchievementsDataUpdate)
    }
  }

  // Reset the sent flag when changedAchievementsData becomes false
  if (!changedAchievementsData) sentAchievementsData = false

  setTimeout(func, 200) // Check every 200ms
}, 50)

readCurrentGamesDir()
sendAllAchievementsDataToRenderer()

setTimeout(() => {
  sendPlayedTimeToRenderer()
}, 100)

export {
  checkUserJSONExistence,
  storeGamesDir,
  readGameDir,
  watchFolderForChanges,
  setMainWindow,
  saveExeFileName,
  readExeFileNames,
  saveGamePlayedTime,
  addGameManually
}
