import { useState, useEffect } from 'react'
import './libraryGameHeader.css'

//CONTEXT
import { useGameDataContext } from '../../DataContext/DataContext'
const LibraryGameHeader = (props) => {
  const { libraryCachePath, allGamesImagesData } = useGameDataContext()

  const [imageSrc, setImageSrc] = useState(null)
  const [run, setRun] = useState(true)

  useEffect(() => {
    if (allGamesImagesData.length === 0 || libraryCachePath === '' || run === false) {
      return
    }

    const gameImagesData = allGamesImagesData.find(
      (gameImageData) => gameImageData.gameID === props.gameID
    )

    if (gameImagesData) {
      const path = `${libraryCachePath}\\${gameImagesData?.imageNames?.libraryHeader_name}`
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
          // Handle error appropriately, like displaying an error message
        })

      setRun(false)

      // Cleanup function to revoke object URLs
      return () => {
        if (imageSrc) {
          URL.revokeObjectURL(imageSrc)
        }
      }
    }
  }, [allGamesImagesData])

  return (
    <div className="home__library-game-header">
      <div className="libraryHeader-container" onClick={props.onClick}>
        {imageSrc && <img src={imageSrc} alt="libraryHeader" />}
      </div>
    </div>
  )
}

export default LibraryGameHeader
