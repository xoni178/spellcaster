import { useEffect, useState } from 'react'
import './allAchievementsDisplay.css'

//Icons
import { RiCloseLargeFill } from 'react-icons/ri'

//Components
import TrophieComponent from '../../TrophieComponent/TrophieComponent'
import ProgressBar from '../ProgressBar/ProgressBar'

//Context
import { useGameDataContext } from '../../../../DataContext/DataContext'

const AllAchievementsDisplay = ({
  setDisplayAllAchievements,
  clickedGameIconIndex,
  achievementsNumbers,
  allUnlockedAchievements,
  allLockedAchievements,
  allHiddenAchievementsNumber
}) => {
  const { gamesData, libraryCachePath, allGamesImagesData } = useGameDataContext()

  const [gameIconimageSrc, setGameIconImageSrc] = useState(null)
  const [run, setRun] = useState(true)

  const [gameName, setGameName] = useState('')

  //get gameIcon
  useEffect(() => {
    if (allGamesImagesData.length === 0 || libraryCachePath === '' || run === false) {
      return
    }
    const gameID = gamesData[clickedGameIconIndex]?.gameID

    const gameImagesData = allGamesImagesData.find(
      (gameImageData) => gameImageData.gameID === gameID
    )

    if (gameImagesData) {
      const path = `${libraryCachePath}\\${gameImagesData?.imageNames?.icon_name}`
      // Send IPC request to request image data
      window.ipc
        .invoke('request-image', path)
        .then((response) => {
          const blob = new Blob([response.data], { type: response.mimeType })
          const newImageSrc = URL.createObjectURL(blob)
          setGameIconImageSrc(newImageSrc)
        })
        .catch((error) => {
          console.error('Error fetching image:', error)
          // Handle error appropriately, like displaying an error message
        })

      setRun(false)

      // Cleanup function to revoke object URLs
      return () => {
        if (gameIconimageSrc) {
          URL.revokeObjectURL(gameIconimageSrc)
        }
      }
    }
  }, [allGamesImagesData])

  //Get game name
  useEffect(() => {
    if (gamesData.length === 0) return

    setGameName(gamesData[clickedGameIconIndex]?.gameName)
  }, [gamesData])

  return (
    <div className="achievements__all-achievements-display">
      <div
        className="all-achievements-display__close-button"
        onClick={() => setDisplayAllAchievements(false)}
      >
        <RiCloseLargeFill style={{ width: '50%', height: '50%' }} />
      </div>
      <div className="all-achievements-display__header">
        <div className="header__game-title-container">
          <div className="game-title">
            <div className="game-icon-container">
              {gameIconimageSrc && <img src={gameIconimageSrc}></img>}
            </div>
            <h4>{gameName}</h4>
          </div>
        </div>
        <ProgressBar achievementsNumbers={achievementsNumbers} />
      </div>

      <div className="all-achievements-display__body">
        <div className="all-trophies__title">
          <p>Unlocked Achievements</p>
        </div>
        <div className="all-trophies__body">
          {allUnlockedAchievements &&
            allUnlockedAchievements.map((unlockedAchievement, index) => (
              <TrophieComponent
                key={index}
                TrophyData={unlockedAchievement}
                TrophieComponentForm={0}
              />
            ))}
        </div>
        <div className="all-trophies__title">
          <p>Locked Achievements</p>
        </div>
        <div className="all-trophies__body">
          {allLockedAchievements &&
            allLockedAchievements.map((lockedAchievement, index) => (
              <TrophieComponent
                key={index}
                TrophyData={lockedAchievement}
                TrophieComponentForm={1}
              />
            ))}
        </div>
        <div className="all-trophies__title">
          <p>Hidden Achievements</p>
        </div>
        {allHiddenAchievementsNumber && allHiddenAchievementsNumber >= 1 ? (
          <div className="all-trophies__body">
            <TrophieComponent TrophyData={allHiddenAchievementsNumber} TrophieComponentForm={2} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AllAchievementsDisplay
