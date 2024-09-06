import { useEffect, useState, useRef } from 'react'
import './gameBanner.css'

//Icons
import { HiMiniCog8Tooth } from 'react-icons/hi2'
import GameIcon from './GameIcon/GameIcon.jsx'
import { RiMoreFill } from 'react-icons/ri'
import { IoMdAddCircle } from 'react-icons/io'

import logo from '../../../assets/logos/SpellCaster_Icon.png'

//Context
import { useGameDataContext } from '../../../DataContext/DataContext.jsx'

const GameBanner = ({
  setIsLibraryHome,
  isLibraryHome,
  setShowSetting,
  setClickedGameIconIndex,
  clickedGameIconIndex,
  setShowAddGame
}) => {
  const { gamesData } = useGameDataContext()

  const [infoButtonsMouseOver, setInfoButtonsCogMouseOver] = useState(false)
  const [gameIconMouseOverText, setGameIconMouseOverText] = useState('')
  const [mouseCoordiantes, setMouseCoordinates] = useState({ x: 0, y: 0 })

  const holdTimeout = useRef(null)

  const handleOnMouseOver = (index) => {
    holdTimeout.current = setTimeout(() => {
      const gameName = gamesData[index].gameName
      if (gameName) setGameIconMouseOverText(gameName)
    }, 1000)
  }

  const handleOnMouseOut = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current)
    }
    setGameIconMouseOverText('')
  }

  const handleGameIconOnClick = (index) => {
    setIsLibraryHome(false)
    setClickedGameIconIndex(index)
  }

  const handleGameIconClassName = (index) => {
    let className = 'game__game-icon'

    if (clickedGameIconIndex === index && isLibraryHome === false) {
      className += ' selected'
    }

    return className
  }

  const handleInfoButtonsClassName = () => {
    let className = ''

    if (infoButtonsMouseOver) className = 'hover'

    return className
  }

  const getButtonClassName = () => {
    let className = 'game-banner__home-button'

    if (isLibraryHome) {
      className = className + ' ' + 'home-button-active'
    }

    return className
  }

  return (
    <>
      {gameIconMouseOverText ? (
        <div
          style={{
            background: 'var(--Tab-color)',
            position: 'absolute',
            top: `${mouseCoordiantes.y - 20}px`,
            left: `${mouseCoordiantes.x - 280}px`,
            padding: '3px',
            border: '1px solid var(--Active-color)',
            zIndex: '2'
          }}
        >
          <p style={{ color: 'white' }}>{gameIconMouseOverText}</p>
        </div>
      ) : null}
      <div
        className="spellcaster__game-banner"
        onMouseMove={(e) => setMouseCoordinates({ x: e.screenX, y: e.screenY })}
      >
        <div className="logo">
          <img src={logo} alt="spellcaster-logo" style={{ width: '30px', height: '30px' }} />
        </div>
        <div className={getButtonClassName()} onClick={() => setIsLibraryHome(true)}>
          <p>Home</p>
        </div>
        <div className="game-banner__game-list">
          {gamesData &&
            gamesData.map((gameData, index) => (
              <GameIcon
                key={index}
                onClick={() => handleGameIconOnClick(index)}
                className={handleGameIconClassName(index)}
                gameID={gameData.gameID}
                onMouseOver={() => handleOnMouseOver(index)}
                onMouseOut={() => handleOnMouseOut()}
              />
            ))}
        </div>
        <div className="game-banner__infoIcons">
          {gamesData && gamesData.length > 20 ? (
            <RiMoreFill style={{ width: '20px', height: '20px', color: '#fff' }} />
          ) : null}
          <IoMdAddCircle
            className={handleInfoButtonsClassName()}
            onMouseOver={() => setInfoButtonsCogMouseOver(true)}
            onMouseOut={() => setInfoButtonsCogMouseOver(false)}
            style={{
              width: '25px',
              height: '25px',
              color: 'white'
            }}
            onClick={() => setShowAddGame(true)}
          />
          <HiMiniCog8Tooth
            className={handleInfoButtonsClassName()}
            onMouseOver={() => setInfoButtonsCogMouseOver(true)}
            onMouseOut={() => setInfoButtonsCogMouseOver(false)}
            style={{
              width: '30px',
              height: '30px',
              color: 'white'
            }}
            onClick={() => setShowSetting(true)}
          />
        </div>
      </div>
    </>
  )
}

export default GameBanner
