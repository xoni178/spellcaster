import { createContext, useContext, useEffect, useState } from 'react'

const GameDataContext = createContext()

export const DataContext = ({ children }) => {
  const [gamesData, setGamesData] = useState([])
  const [allGamesImagesData, setAllGamesImagesData] = useState([])
  const [allGamesAchievements, setAllGamesAchievements] = useState([])
  const [libraryCachePath, setLibraryCachePath] = useState('')
  const [playedTimeData, setPlayedTimeData] = useState('')

  useEffect(() => {
    window.api.getAllGamesData((data) => {
      setGamesData(data)
      console.log('gamesData', data)
    })

    window.api.getLibraryCachePath((path) => {
      setLibraryCachePath(path)
      console.log('libraryCachePath', path)
    })

    window.api.getAllGamesImagesData((data) => {
      setAllGamesImagesData(data)
      console.log('allGamesImagesData', data)
    })

    window.api.getAchievements((data) => {
      setAllGamesAchievements(data)
      console.log('allGamesAchievements', data)
    })

    window.api.getPlayedTime((data) => {
      setPlayedTimeData(data)

      console.log('playedTimeData', data)
    })

    console.log('hi production')
  }, [])

  return (
    <GameDataContext.Provider
      value={{
        gamesData,
        libraryCachePath,
        allGamesImagesData,
        allGamesAchievements,
        playedTimeData
      }}
    >
      {children}
    </GameDataContext.Provider>
  )
}

export const useGameDataContext = () => useContext(GameDataContext)
