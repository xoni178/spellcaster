import { useState, useEffect } from 'react'
import { GameBanner, GameDisplay, LibraryHome, AllAchievementsDisplay } from '../../components'
import './gameLibrary.css'

//context
import { useGameDataContext } from '../../DataContext/DataContext'

const GameLibrary = ({ setShowSetting, setShowAddGame }) => {
  const { gamesData, allGamesAchievements } = useGameDataContext()

  const [isLibraryHome, setIsLibraryHome] = useState(true)
  const [displayAllAchievements, setDisplayAllAchievements] = useState(false)
  const [clickedGameIconIndex, setClickedGameIconIndex] = useState(null)

  const [achievementsNumbers, setAchievementsNumbers] = useState({
    unlocked: 0,
    locked: 0,
    all: 0
  })

  //Get trophies/achievements----

  const [allUnlockedAchievements, setAllUnlockedAchievements] = useState(null)
  const [allLockedAchievements, setAllLockedAchievements] = useState(null)
  const [allHiddenAchievementsNumber, setAllHiddenAchievementsNumber] = useState(null)

  const getAllUnlockedAchievements = (allAchievements) => {
    const unlockedAchievements = allAchievements.filter(
      (gameAchievements) => gameAchievements?.achieved === true
    )

    setAllUnlockedAchievements(unlockedAchievements)
  }
  const getAllLockedAchievements = (allAchievements) => {
    const lockedAchievements = allAchievements.filter(
      (gameAchievements) => gameAchievements?.achieved === false && gameAchievements.hidden == 0
    )

    setAllLockedAchievements(lockedAchievements)
  }

  const getAllHiddenAchievements = (allAchievements) => {
    let hiddenAchievementsCounter = 0

    allAchievements.forEach((gameAchievements) => {
      if (gameAchievements.hidden == 1 && gameAchievements.achieved !== true) {
        hiddenAchievementsCounter++
      }
    })

    setAllHiddenAchievementsNumber(hiddenAchievementsCounter)
  }

  const getNumberOfUnlockedAndLockedAchievements = () => {
    if (allUnlockedAchievements && allUnlockedAchievements) {
      const unlockedNumber = allUnlockedAchievements.length
      const lockedNumber = allLockedAchievements.length

      const allNumber = unlockedNumber + lockedNumber + allHiddenAchievementsNumber

      setAchievementsNumbers({ unlocked: unlockedNumber, locked: lockedNumber, all: allNumber })
    } else setAchievementsNumbers({ unlocked: 0, locked: 0, all: 0 })
  }

  useEffect(() => {
    if (allGamesAchievements.length === 0 || clickedGameIconIndex === null) return

    const gameID = gamesData[clickedGameIconIndex].gameID

    const allAchievements = allGamesAchievements.find((gameAchievements) =>
      Object.keys(gameAchievements).includes(gameID)
    )
    if (!allAchievements) {
      setAllUnlockedAchievements(null)
      setAllLockedAchievements(null)
      setAllHiddenAchievementsNumber(null)
      return
    }
    getAllUnlockedAchievements(allAchievements[gameID])
    getAllLockedAchievements(allAchievements[gameID])
    getAllHiddenAchievements(allAchievements[gameID])
  }, [allGamesAchievements, clickedGameIconIndex])

  useEffect(() => {
    getNumberOfUnlockedAndLockedAchievements()
  }, [allUnlockedAchievements, allLockedAchievements])
  //______

  return (
    <div className="spellcaster__game-library">
      <GameBanner
        setIsLibraryHome={(val) => setIsLibraryHome(val)}
        isLibraryHome={isLibraryHome}
        clickedGameIconIndex={clickedGameIconIndex}
        setClickedGameIconIndex={(val) => setClickedGameIconIndex(val)}
        setShowSetting={(val) => setShowSetting(val)}
        setShowAddGame={(val) => setShowAddGame(val)}
      />
      {isLibraryHome ? (
        <LibraryHome
          setClickedGameIconIndex={(val) => setClickedGameIconIndex(val)}
          setIsLibraryHome={(val) => setIsLibraryHome(val)}
        />
      ) : (
        <GameDisplay
          clickedGameIconIndex={clickedGameIconIndex}
          setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
          displayAllAchievements={displayAllAchievements}
          achievementsNumbers={achievementsNumbers}
        />
      )}
      {displayAllAchievements && (
        <AllAchievementsDisplay
          setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
          clickedGameIconIndex={clickedGameIconIndex}
          allUnlockedAchievements={allUnlockedAchievements}
          allLockedAchievements={allLockedAchievements}
          allHiddenAchievementsNumber={allHiddenAchievementsNumber}
          achievementsNumbers={achievementsNumbers}
        />
      )}
    </div>
  )
}

export default GameLibrary
