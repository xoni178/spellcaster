const fs = require('fs')
const path = require('path')
const axios = require('axios')

import { app } from 'electron'

const libraryDirPath = path.join(app.getPath('userData'), 'libraryCache')

let gameDataMap
let allGamesImages = []

const downloadImage = (url, imagePath, gameID) => {
  try {
    axios({
      url,
      responseType: 'stream'
    }).then(
      (response) =>
        new Promise((resolve, reject) => {
          response.data
            .pipe(fs.createWriteStream(path.join(libraryDirPath, imagePath)))
            .on('finish', () => resolve())
            .on('error', (e) => reject(e))
        })
    )
  } catch (err) {
    console.error(`Error downloading image from ${url}:`, err)
  }
}

const requestImageDownload = async (gameID, imagePath, imageName, imageType) => {
  const url = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${gameID}/${imageName}.${imageType}`

  await downloadImage(url, imagePath, gameID)
}

const requestIconDownload = async (gameID, imagePath) => {
  const hashCode = await getGameIconHashCode(gameID)

  const url = `http://media.steampowered.com/steamcommunity/public/images/apps/${gameID}/${hashCode}.jpg`

  await downloadImage(url, imagePath, gameID)
}

const preprocessGameData = async () => {
  try {
    const rawData = await axios.get(
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
      {
        params: {
          key: '7E08C669B3792800527630DEDBFDB358',
          steamid: '76561198028121353',
          include_appinfo: true,
          include_played_free_games: true,
          format: 'json'
        }
      }
    )

    const games = rawData.data.response.games
    if (!games) {
      throw new Error('No games data found in the API response')
    }

    // Preprocess games into a hash map
    gameDataMap = games.reduce((map, game) => {
      map[game.appid] = game
      return map
    }, {})

    console.log('Game data map created successfully.')
  } catch (err) {
    console.error('Error in preprocessGameData:', err)
  }
}

// Function to get the game icon hash code using the preprocessed hash map
const getGameIconHashCode = async (gameID) => {
  try {
    // Ensure the game data map is initialized
    if (!gameDataMap) {
      await preprocessGameData()
    }

    const gameData = gameDataMap[gameID]
    if (!gameData) {
      throw new Error(`Game data not found for gameID: ${gameID}`)
    }

    if (!gameData.img_icon_url) {
      throw new Error(`img_icon_url is undefined for gameID: ${gameID}`)
    }

    return gameData.img_icon_url
  } catch (err) {
    console.error(`Error in getGameIconHashCode for gameID ${gameID}:`, err)
    return null
  }
}

//Function to get the game images and icon from api if needed
const getGameDataFromApi = (gamesInfo) => {
  try {
    if (gamesInfo.length === 0) {
      console.log('No games to get images for....')
      return
    }

    gamesInfo.forEach((gameInfo) => {
      let images = {
        libraryHeader_name: `${gameInfo.gameID}_library_600x900.jpg`,
        libraryHero_name: `${gameInfo.gameID}_library_hero.jpg`,
        logo_name: `${gameInfo.gameID}_logo.png`,
        icon_name: `${gameInfo.gameID}_icon.jpg`,
        header_name: `${gameInfo.gameID}_header.jpg`
      }
      let gameImages = {
        gameID: gameInfo.gameID,
        imageNames: images
      }

      allGamesImages.push(gameImages)
    })

    fs.readdir(libraryDirPath, (err, files) => {
      if (err) {
        console.error('Error reading library directory:', err)
        return
      }

      allGamesImages.forEach((gameImages) => {
        if (!files.includes(gameImages.imageNames.libraryHeader_name)) {
          requestImageDownload(
            gameImages.gameID,
            gameImages.imageNames.libraryHeader_name,
            'library_600x900',
            'jpg'
          )
        }

        if (!files.includes(gameImages.imageNames.libraryHero_name)) {
          requestImageDownload(
            gameImages.gameID,
            gameImages.imageNames.libraryHero_name,
            'library_hero',
            'jpg'
          )
        }

        if (!files.includes(gameImages.imageNames.logo_name)) {
          requestImageDownload(gameImages.gameID, gameImages.imageNames.logo_name, 'logo', 'png')
        }

        if (!files.includes(gameImages.imageNames.header_name)) {
          requestImageDownload(
            gameImages.gameID,
            gameImages.imageNames.header_name,
            'header',
            'jpg'
          )
        }

        if (!files.includes(gameImages.imageNames.icon_name)) {
          requestIconDownload(gameImages.gameID, gameImages.imageNames.icon_name)
        }
      })
    })
  } catch (err) {
    console.error('Error in getGameDataFromApi:', err)
  }
}

const makeLibraryDir = () => {
  if (!fs.existsSync(libraryDirPath)) {
    fs.mkdirSync(libraryDirPath)
  }
}

const getGameName = async (gameID) => {
  try {
    let data

    const rawData = await axios.get('https://store.steampowered.com/api/appdetails', {
      params: {
        appids: gameID,
        filters: 'basic'
      }
    })

    if (rawData) {
      data = Object.values(rawData.data)[0].data
    }

    return data?.name
  } catch (error) {
    console.error('Error trying to get game name: ', error)
  }
}

const getNewsApi = async (gameID, numberOfNewsItems) => {
  try {
    const url = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/'
    const rawData = await axios
      .get(url, {
        params: {
          appid: gameID,
          count: numberOfNewsItems,
          maxlength: 0,
          feeds: 'steam_community_announcements'
        }
      })
      .catch((e) => console.error('Error when trying to get news form api: ', e))

    const newsItems = rawData?.data?.appnews?.newsitems

    return newsItems
  } catch (err) {
    console.error('Error getting game news', err)
  }
}

makeLibraryDir()
export { getGameDataFromApi, getGameName, libraryDirPath, allGamesImages, getNewsApi }
