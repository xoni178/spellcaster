const fs = require('fs')
const path = require('path')
import { app } from 'electron'
const axios = require('axios')
const chokidar = require('chokidar')
import { VariableEmitter } from './variableEmitter'

const achievementsCachePath = path.join(app.getPath('userData'), 'AchievementsCache')
const achievementsImgCachePath = path.join(achievementsCachePath, 'img')
const achievementsJSONPath = path.join(achievementsCachePath, 'achievements.json')

const steamEmuPath = path.join(app.getPath('appData'), 'Goldberg SteamEmu Saves')

let readAchievements = []
const allAchievementsData = new VariableEmitter([])
let changedAchievementsData

const createAchievemnetsCacheFolder = () => {
  if (!fs.existsSync(achievementsCachePath)) {
    fs.mkdirSync(achievementsCachePath)
  }
  if (!fs.existsSync(achievementsImgCachePath)) {
    fs.mkdirSync(achievementsImgCachePath)
  }
}

const getAchievements = async (folderPath, hasAchievedAchievement = false) => {
  try {
    createAchievemnetsCacheFolder()
    if (fs.existsSync(folderPath)) {
      fs.readdir(folderPath, (err, files) => {
        if (err) throw new Error(err)

        files.forEach(async (file) => {
          if (file === 'steam_appid.txt') {
            const gameID = fs.readFileSync(path.join(folderPath, file), {
              encoding: 'utf-8'
            })

            if (!fs.existsSync(achievementsJSONPath)) fs.writeFileSync(achievementsJSONPath, '')

            fs.readFile(achievementsJSONPath, { encoding: 'utf-8' }, (err, rawData) => {
              if (err) throw new Error(err)

              if (rawData) {
                const data = JSON.parse(rawData)

                if (!Object.keys(data).includes(gameID) || hasAchievedAchievement) {
                  saveAchievements(gameID, data, hasAchievedAchievement)
                }
              } else {
                saveAchievements(gameID, hasAchievedAchievement)
              }
            })
          }
          if (file === 'achievements.json') {
            fs.readFile(path.join(folderPath, file), { encoding: 'utf-8' }, (err, rawData) => {
              readAchievements = JSON.parse(rawData)
            })
          }
          if (file === 'img') {
            fs.readdir(path.join(folderPath, file), (err, images) => {
              if (err) throw new Error(err)

              images.forEach((image) => {
                if (!fs.existsSync(path.join(achievementsImgCachePath, image))) {
                  fs.readFile(path.join(folderPath, file, image), (err, data) => {
                    if (err) throw new Error(err)

                    fs.writeFileSync(path.join(achievementsImgCachePath, image), data)
                  })
                }
              })
            })
          }
        })
      })
    } else {
      if (fs.existsSync(path.join(achievementsCachePath, 'achievements.json'))) {
        fs.readFile(
          path.join(achievementsCachePath, 'achievements.json'),
          { encoding: 'utf-8' },
          (err, rawData) => {
            console.log(JSON.parse(rawData))
            readAchievements = JSON.parse(rawData)
          }
        )
      }
    }
  } catch (err) {
    console.error('could not get achievemenets', err)
  }
}

const saveAchievements = async (gameID, readSavedAchievements = null, hasAchievedAchievement) => {
  let gameAchievementsObj = {}
  let achievemenetsToSave = []

  const achievements = await waitForReadAchievementsExistence(2000)

  if (readSavedAchievements && achievements) {
    const isSaved = readSavedAchievements.find((savedAchievement) =>
      Object.keys(savedAchievement).includes(gameID)
    )

    if (hasAchievedAchievement) {
      const otherGamesAchievements = readSavedAchievements.filter(
        (savedAchievement) => !Object.keys(savedAchievement)[0] == gameID
      )

      gameAchievementsObj[gameID] = await getCompletedAchievements(gameID, achievements)
      achievemenetsToSave = [...otherGamesAchievements, gameAchievementsObj]

      allAchievementsData.value = [...achievemenetsToSave]

      fs.writeFileSync(achievementsJSONPath, JSON.stringify(achievemenetsToSave))
    }

    if (!isSaved) {
      gameAchievementsObj[gameID] = await getCompletedAchievements(gameID, achievements)

      achievemenetsToSave = [...readSavedAchievements, gameAchievementsObj]

      allAchievementsData.value = [...achievemenetsToSave]

      fs.writeFileSync(achievementsJSONPath, JSON.stringify(achievemenetsToSave))
    } else {
      gameAchievementsObj[gameID] = await getCompletedAchievements(gameID, achievements)

      allAchievementsData.value = [gameAchievementsObj]
    }
  } else {
    if (achievements) {
      gameAchievementsObj[gameID] = await getCompletedAchievements(gameID, achievements)

      achievemenetsToSave.push(gameAchievementsObj)

      allAchievementsData.value = achievemenetsToSave

      fs.writeFileSync(achievementsJSONPath, JSON.stringify(achievemenetsToSave))
    }
  }
}

const waitForReadAchievementsExistence = (waitTime) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    setTimeout(function func() {
      if (Date.now() - startTime < waitTime) {
        if (readAchievements) {
          resolve(readAchievements)
        } else setTimeout(func, 100)
      } else reject(null)
    }, 100)
  })
}

const getCompletedAchievements = (gameID, achievements) => {
  return new Promise((resolve, reject) => {
    let completetdAchievementsData = []
    let rawAchievedAchievements
    let achievedAchievements

    fs.readdir(steamEmuPath, async (err, files) => {
      if (err) {
        reject(err)
        return
      }

      if (files.includes(gameID)) {
        rawAchievedAchievements = fs.readFileSync(
          path.join(steamEmuPath, gameID, 'achievements.json'),
          { encoding: 'utf-8' }
        )
      }
      const achievemenetsPercentages = await getAchievemenetPercentages(gameID)

      if (rawAchievedAchievements) achievedAchievements = JSON.parse(rawAchievedAchievements)

      achievements.forEach((achievement) => {
        let obj = {
          hidden: achievement.hidden,
          displayName: achievement.displayName.english,
          description: achievement.description.english,
          icon: achievement.icon,
          icon_gray: achievement.icon_gray,
          name: achievement.name,
          percent: achievemenetsPercentages.find(
            (achievementPercent) => achievementPercent.name === achievement.name
          ).percent
        }

        if (achievedAchievements) {
          obj.achieved = achievedAchievements[achievement.name].earned
          obj.achieved_time = achievedAchievements[achievement.name].earned_time
        }

        completetdAchievementsData.push(obj)
      })

      resolve(completetdAchievementsData)
    })
  })
}

const getAchievemenetPercentages = async (gameID) => {
  try {
    const url =
      'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/'
    const rawData = await axios.get(url, {
      params: {
        gameid: gameID
      }
    })

    const data = rawData?.data?.achievementpercentages?.achievements

    return data
  } catch (err) {
    console.error(err)
  }
}
const watchForAchievedAchievementsFileChanges = (folderPath) => {
  try {
    let gameID
    const files = fs.readdirSync(folderPath)

    files.forEach((file) => {
      if (file === 'steam_appid.txt') {
        gameID = fs.readFileSync(path.join(folderPath, file), { encoding: 'utf-8' })
      }
    })
    console.log(path.join(steamEmuPath, gameID, 'achievements.json'))
    const watcher = chokidar.watch(path.join(steamEmuPath, gameID, 'achievements.json'), {
      persistent: true,
      awaitWriteFinish: true,
      ignoreInitial: true
    })
    watcher
      .on('change', (path, stats) => {
        console.log('changed')
        getAchievements(folderPath, true)
        setChangedAchievementsData(true)
      })
      .on('error', (error) => console.log(`Watcher error: ${error}`))
  } catch (err) {
    console.error(err)
  }
}

const setChangedAchievementsData = (value) => {
  changedAchievementsData = value
}

export {
  getAchievements,
  watchForAchievedAchievementsFileChanges,
  changedAchievementsData,
  allAchievementsData,
  setChangedAchievementsData,
  achievementsImgCachePath
}
