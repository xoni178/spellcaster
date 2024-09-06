import { useState, useEffect } from 'react'

import './trophyIcons.css'

const TrophyIcons = ({
  displayButton,
  setDisplayAllAchievements,
  trophieImageSrc,
  onMouseOver,
  onMouseOut,
  isUnlockedTrophy,
  achievementsNumbers,
  percent
}) => {
  const [imageSrc, setImageSrc] = useState('')
  const [rareBorder, setRareBorder] = useState(null)

  useEffect(() => {
    if (!trophieImageSrc) return

    const trophyIconsPATH = 'C:\\Users\\egzon\\AppData\\Roaming\\spellcaster\\AchievementsCache'
    const path = `${trophyIconsPATH}\\${trophieImageSrc}`
    // Send IPC request to request image data
    window.ipc
      .invoke('request-image', path)
      .then((response) => {
        const blob = new Blob([response.data], { type: response.mimeType })
        const newImageSrc = URL.createObjectURL(blob)
        setImageSrc(newImageSrc)
      })
      .catch((error) => {
        console.error('Error fetching image:', error)
      })

    // Cleanup function to revoke object URLs
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [trophieImageSrc])

  useEffect(() => {
    if (percent) {
      setRareBorder(`${percent <= 10 ? '2px solid gold' : null}`)
    }
  }, [percent])

  return (
    <div
      className="achievements__icons-container"
      onMouseOut={onMouseOut}
      onMouseOver={onMouseOver}
      style={{ border: rareBorder }}
      onClick={() => setDisplayAllAchievements(true)}
    >
      {displayButton ? (
        <div className="all-trophies-button" onClick={() => setDisplayAllAchievements(true)}>
          <p>
            +
            {isUnlockedTrophy ? achievementsNumbers?.unlocked - 5 : achievementsNumbers?.locked - 4}
          </p>
        </div>
      ) : (
        imageSrc && <img src={imageSrc} alt="icon" />
      )}
    </div>
  )
}

export default TrophyIcons
