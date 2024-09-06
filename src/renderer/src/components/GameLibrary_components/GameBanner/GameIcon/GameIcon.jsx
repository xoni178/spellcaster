import { useState, useEffect } from 'react'

import './gameIcon.css'

//Context
import { useGameDataContext } from '../../../../DataContext/DataContext'

const GameIcon = (props) => {
  const { libraryCachePath, allGamesImagesData } = useGameDataContext()

  const [gameIconimageSrc, setGameIconImageSrc] = useState(null)
  const [run, setRun] = useState(true)

  useEffect(() => {
    if (allGamesImagesData.length === 0 || libraryCachePath === '' || run === false) {
      return
    }

    const gameImagesData = allGamesImagesData.find(
      (gameImageData) => gameImageData.gameID === props.gameID
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

  return (
    <div
      className={props.className}
      onClick={props.onClick}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
    >
      <div className="img-container">
        {gameIconimageSrc && <img src={gameIconimageSrc} alt="icon" />}
      </div>
    </div>
  )
}

export default GameIcon
