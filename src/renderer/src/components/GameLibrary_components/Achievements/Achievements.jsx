import { useState, useEffect, useRef, useCallback } from 'react'
import { throttle } from 'lodash'
import './achievements.css'

//Components
import TrophyIcons from './TrophyIcons/TrophyIcons.jsx'
import TrophyComponent from '../TrophieComponent/TrophieComponent.jsx'
import ProgressBar from './ProgressBar/ProgressBar.jsx'

//Context
import { useGameDataContext } from '../../../DataContext/DataContext.jsx'

const Achievements = ({ setDisplayAllAchievements, clickedGameIconIndex, achievementsNumbers }) => {
  const { allGamesAchievements, gamesData } = useGameDataContext()

  //Trophies data
  const [firstUnlockedTrophy, setFirstUnlockedTrophy] = useState()

  const [displayUnlockedTrophies, setDisplayUnlockedTrophies] = useState()
  const [displayLockedTrophies, setDisplayLockedTrophies] = useState()

  //Hover State handlers-------------------------------------------------------------------------------------------

  const [achievementIconMouseOverText, setAchievementIconMouseOverText] = useState({
    name: '',
    desc: ''
  })
  const [mouseCoordiantes, setMouseCoordinates] = useState({ x: 0, y: 0 })

  const holdTimeout = useRef(null)

  const handleOnMouseOver = (name, desc) => {
    holdTimeout.current = setTimeout(() => {
      if (name && desc) setAchievementIconMouseOverText({ name: name, desc: desc })
    }, 1500)
  }

  const handleOnMouseOut = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current)
    }
    setAchievementIconMouseOverText('')
  }

  //_______________________________________________________________________________________________________________

  const handleOnMouseMove = useCallback(
    throttle((e) => {
      setMouseCoordinates({ x: e.clientX, y: e.clientY })
    }, 1000),
    []
  )

  //Get Trophies ----------------------------------------------------------------------------------------------------
  const getUnlockedTrophies = (index) => {
    const gameID = gamesData[index].gameID
    let trophies = []

    const allGameAchievements = allGamesAchievements.find((gameAchievements) =>
      Object.keys(gameAchievements).includes(gameID)
    )

    if (!allGameAchievements) {
      setFirstUnlockedTrophy(null)
      setDisplayUnlockedTrophies(null)
      return
    }

    //Sort unlocked trophies to display the 6 rarest tophies
    const unsorted = allGameAchievements[gameID].filter(
      (achievement) => achievement.achieved === true
    )

    for (var i = 1; i <= 6; i++) {
      let obj
      let value = 101

      for (var j = 0; j < unsorted.length; j++) {
        if (unsorted[j].percent < value) {
          const existInTest = trophies.find((trophy) => trophy?.name === unsorted[j]?.name)

          if (!existInTest) {
            value = unsorted[j].percent
            obj = unsorted[j]
          }
        }
      }

      if (!obj) break

      trophies.push(obj)
    }

    //-------------
    setFirstUnlockedTrophy(trophies[0])

    const unlockedTrophiesToDisplay = trophies.filter((unlockedTrophie, index) => index !== 0)

    setDisplayUnlockedTrophies(unlockedTrophiesToDisplay)
  }

  const getLockedTrophies = (index) => {
    const gameID = gamesData[index].gameID
    let trophies = []

    const allGameAchievements = allGamesAchievements.find((gameAchievements) =>
      Object.keys(gameAchievements).includes(gameID)
    )

    if (!allGameAchievements) {
      setDisplayLockedTrophies(null)
      return
    }

    while (trophies.length < 6) {
      const gameAchievement = allGameAchievements[gameID].find(
        (achievement) =>
          achievement.achieved === false &&
          achievement.hidden == 0 &&
          !trophies.includes(achievement)
      )
      if (!gameAchievement) break
      trophies.push(gameAchievement)
    }

    const lockedTrophiesToDisplay = trophies.filter((lockedTrophie, index) => index !== 0)

    setDisplayLockedTrophies(lockedTrophiesToDisplay)
  }

  //_______________________________________________________________________________________________________________

  useEffect(() => {
    getUnlockedTrophies(clickedGameIconIndex)
    getLockedTrophies(clickedGameIconIndex)
  }, [allGamesAchievements, clickedGameIconIndex])

  return (
    <>
      {achievementIconMouseOverText.name && achievementIconMouseOverText.desc ? (
        <div
          style={{
            background: 'var(--Tab-color)',
            position: 'absolute',
            top: `${mouseCoordiantes.y - 535}px`,
            left: `${mouseCoordiantes.x - 1200}px`,
            border: '1px solid var(--Active-color)',
            zIndex: '2',
            maxWidth: '300px'
          }}
        >
          <div style={{ margin: '3px' }}>
            <p style={{ color: 'white', fontSize: '22px' }}>{achievementIconMouseOverText.name}</p>
            <p style={{ color: 'white', marginTop: '8px' }}>{achievementIconMouseOverText.desc}</p>
          </div>
        </div>
      ) : null}

      <div className="game-display__achievements" onMouseMove={(e) => handleOnMouseMove(e)}>
        <div className="achievements-body__title">
          <p>Achievements</p>
        </div>
        <div className="achievements__achievements-body">
          <ProgressBar achievementsNumbers={achievementsNumbers} />
          <div className="achievements-body_unlocked">
            {firstUnlockedTrophy && (
              <div className="unlocked__trophy-component-container">
                <TrophyComponent TrophyData={firstUnlockedTrophy} TrophieComponentForm={0} />
              </div>
            )}
            <div className="unlocked__tropies-list">
              {displayUnlockedTrophies &&
                displayUnlockedTrophies.map((unlockedTrophie, index) => {
                  if (index === 4) {
                    return (
                      <TrophyIcons
                        key={index}
                        displayButton={true}
                        setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
                        isUnlockedTrophy={true}
                        achievementsNumbers={achievementsNumbers}
                      />
                    )
                  } else {
                    return (
                      <TrophyIcons
                        key={index}
                        displayButton={false}
                        trophieImageSrc={unlockedTrophie?.icon}
                        onMouseOver={() =>
                          handleOnMouseOver(
                            unlockedTrophie?.displayName,
                            unlockedTrophie?.description
                          )
                        }
                        onMouseOut={() => handleOnMouseOut()}
                        setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
                        percent={unlockedTrophie?.percent}
                      />
                    )
                  }
                })}
            </div>
          </div>
          <div className="achievements-body__locked">
            <div className="locked__title">
              <p>Locked achievements</p>
            </div>
            <div className="locked__tropies-list">
              {displayLockedTrophies &&
                displayLockedTrophies.map((lockedTrophie, index) => {
                  if (index === 4) {
                    return (
                      <TrophyIcons
                        key={index}
                        displayButton={true}
                        isUnlockedTrophy={false}
                        setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
                        achievementsNumbers={achievementsNumbers}
                      />
                    )
                  } else {
                    return (
                      <TrophyIcons
                        key={index}
                        displayButton={false}
                        trophieImageSrc={lockedTrophie.icon_gray}
                        onMouseOver={() =>
                          handleOnMouseOver(lockedTrophie.displayName, lockedTrophie.description)
                        }
                        onMouseOut={() => handleOnMouseOut()}
                        setDisplayAllAchievements={(val) => setDisplayAllAchievements(val)}
                        achievementsNumbers={achievementsNumbers}
                      />
                    )
                  }
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Achievements
