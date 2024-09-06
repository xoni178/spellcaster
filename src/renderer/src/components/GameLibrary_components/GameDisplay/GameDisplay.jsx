import { useState, useEffect, useRef } from 'react'
import './gameDisplay.css'

//Components
import PlayTab from './PlayTab/PlayTab.jsx'
import ActivityFeed from '../ActivityFeed/ActivityFeed.jsx'
import Achievements from '../Achievements/Achievements'

//Context
import { useGameDataContext } from '../../../DataContext/DataContext.jsx'

const GameDisplay = ({
  setDisplayAllAchievements,
  displayAllAchievements,
  clickedGameIconIndex,
  achievementsNumbers
}) => {
  const gameDisplayRef = useRef(null)
  const gameHeroRef = useRef(null)

  const { libraryCachePath, allGamesImagesData, gamesData } = useGameDataContext()

  const [libraryHeroImageSrc, setLibraryHeroImageSrc] = useState(null)
  const [logoImageSrc, setLogoHeroImageSrc] = useState(null)

  useEffect(() => {
    console.log(clickedGameIconIndex)

    if (allGamesImagesData.length === 0 || libraryCachePath === '' || gamesData.length === 0) {
      return
    }

    if (libraryHeroImageSrc) {
      URL.revokeObjectURL(libraryHeroImageSrc)
    }
    if (logoImageSrc) {
      URL.revokeObjectURL(logoImageSrc)
    }

    const gameID = gamesData[clickedGameIconIndex].gameID

    const gameImagesData = allGamesImagesData.find(
      (gameImageData) => gameImageData.gameID === gameID
    )

    if (gameImagesData) {
      const libraryHeroPath = `${libraryCachePath}\\${gameImagesData?.imageNames?.libraryHero_name}`
      const logoPath = `${libraryCachePath}\\${gameImagesData?.imageNames?.logo_name}`

      // Send IPC request to request image data
      window.ipc
        .invoke('request-image', libraryHeroPath)
        .then((response) => {
          const blob = new Blob([response.data], { type: response.mimeType })
          const newImageSrc = URL.createObjectURL(blob)
          setLibraryHeroImageSrc(newImageSrc)
        })
        .catch((error) => {
          console.error('Error fetching image:', error)
        })

      // Send IPC request to request image data
      window.ipc
        .invoke('request-image', logoPath)
        .then((response) => {
          const blob = new Blob([response.data], { type: response.mimeType })
          const newImageSrc = URL.createObjectURL(blob)
          setLogoHeroImageSrc(newImageSrc)
        })
        .catch((error) => {
          console.error('Error fetching image:', error)
        })

      // Cleanup function to revoke object URLs
      return () => {
        if (libraryHeroImageSrc) {
          URL.revokeObjectURL(libraryHeroImageSrc)
        }
        if (logoImageSrc) {
          URL.revokeObjectURL(logoImageSrc)
        }
      }
    }
  }, [allGamesImagesData, gamesData, clickedGameIconIndex])

  useEffect(() => {
    if (displayAllAchievements) {
      gameDisplayRef.current.style.position = 'fixed'
      gameDisplayRef.current.style.top = 0
      gameDisplayRef.current.style.zIndex = -1
      gameDisplayRef.current.style.marginTop = '51px'
    } else {
      gameDisplayRef.current.style.position = 'static'
      gameDisplayRef.current.style.zIndex = 'auto'
      gameDisplayRef.current.style.marginTop = '40px'
    }
  }, [displayAllAchievements])

  useEffect(() => {
    if (libraryHeroImageSrc) {
      gameHeroRef.current.style.background = `url(${libraryHeroImageSrc})`
      gameHeroRef.current.style.backgroundPosition = 'center'
      gameHeroRef.current.style.backgroundSize = 'cover'
      gameHeroRef.current.style.backgroundRepeat = 'no-repeat'
    }
  }, [libraryHeroImageSrc])

  return (
    <div className="game-library__game-display" ref={gameDisplayRef}>
      <div className="game-display__game-hero" ref={gameHeroRef}>
        <PlayTab
          logoImageSrc={logoImageSrc}
          achievementsNumbers={achievementsNumbers}
          clickedGameIconIndex={clickedGameIconIndex}
        />
      </div>
      <div className="game-display__game-info">
        <ActivityFeed clickedGameIconIndex={clickedGameIconIndex} />
        <div className="game-info__sc-and-achievements">
          <Achievements
            setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
            clickedGameIconIndex={clickedGameIconIndex}
            achievementsNumbers={achievementsNumbers}
          />
        </div>
      </div>
    </div>
  )
}

export default GameDisplay
