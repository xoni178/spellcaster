import { useState } from 'react'
import './addGameWindow.css'

const AddGameWindow = ({ setShowAddGame }) => {
  const [gameImages, setGameImages] = useState({
    gameHeaderImg: null,
    gameHeroImg: null,
    gameIconImg: null,
    gameLogoImg: null
  })

  const [gameName, setGameName] = useState(null)
  const [gameFolderPath, setGameFolderPath] = useState(null)

  function generateRandomID() {
    let min = 1000
    let max = 9999999
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const handleCancel = () => {
    setShowAddGame(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      gameImages.gameHeaderImg &&
      gameImages.gameHeroImg &&
      gameImages.gameIconImg &&
      gameImages.gameLogoImg &&
      gameName &&
      gameFolderPath
    ) {
      const gameInfo = {
        gameFolderPath: gameFolderPath,
        gameID: generateRandomID(),
        gameName: gameName,
        gameImages: gameImages
      }
      window.ipc.send('add-new-game', gameInfo)

      setShowAddGame(false)
    }
  }
  return (
    <div className="game-library__add-game-window">
      <h2>ADD GAME TO SPELLCASTER</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="add-game-window__name">
          <label for="game-name">Choose Game Name</label>
          <input
            type="text"
            name="game-name"
            id="game-name"
            placeholder="ex: The Witcher 3 : Wild Hunt"
            required
            onChange={(e) => setGameName(e.target.value)}
          />
        </div>

        <div className="add-game-window__game-file-select">
          <label for="game-dir">Choose Game main Directory</label>
          <div>
            <div
              className="add-game-window__select-game-dir"
              onClick={() =>
                window.api
                  .showDialouge()
                  .then((res) => {
                    setGameFolderPath(res.filePaths[0])
                  })
                  .catch((err) => {
                    console.error('Error selecting game directory:', err)
                  })
              }
            >
              <span>Choose Game Folder</span>
            </div>
            <span>{gameFolderPath}</span>
          </div>
        </div>

        <div className="add-game-window__game-file-select">
          <label for="game-header-img">Choose Game Header Image</label>
          <input
            type="file"
            name="game-header-img"
            id="game-header-img"
            required
            onChange={(e) =>
              setGameImages({
                ...gameImages,
                gameHeaderImg: { name: e.target.files[0].name, path: e.target.files[0].path }
              })
            }
          />
        </div>

        <div className="add-game-window__game-file-select">
          <label for="game-icon-img">Choose Game Icon Image</label>
          <input
            type="file"
            name="game-icon-img"
            id="game-icon-img"
            required
            onChange={(e) =>
              setGameImages({
                ...gameImages,
                gameIconImg: { name: e.target.files[0].name, path: e.target.files[0].path }
              })
            }
          />
        </div>

        <div className="add-game-window__game-file-select">
          <label for="game-hero-img">Choose Game Hero Image</label>
          <input
            type="file"
            name="game-hero-img"
            id="game-hero-img"
            required
            onChange={(e) =>
              setGameImages({
                ...gameImages,
                gameHeroImg: { name: e.target.files[0].name, path: e.target.files[0].path }
              })
            }
          />
        </div>

        <div className="add-game-window__game-file-select">
          <label for="game-logo-img">Choose Game Logo Image</label>
          <input
            type="file"
            name="game-logo-img"
            id="game-logo-img"
            required
            onChange={(e) =>
              setGameImages({
                ...gameImages,
                gameLogoImg: { name: e.target.files[0].name, path: e.target.files[0].path }
              })
            }
          />
        </div>

        <div className="add-game-window__buttons">
          <input type="button" value="Cancel" onClick={() => handleCancel()} />
          <input type="submit" value="Add Game" />
        </div>
      </form>
    </div>
  )
}

export default AddGameWindow
