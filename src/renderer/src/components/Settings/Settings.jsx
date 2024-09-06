import { useEffect, useState } from 'react'

import './settings.css'

//Icons
import { MdOutlineClose } from 'react-icons/md'

const Settings = ({ setShowSetting, isFirstInit, setIsFirstInit }) => {
  const [folderPath, setFolderPath] = useState('')

  useEffect(() => {
    console.log('settings is runing')
    window.document.body.style.overflow = 'hidden'

    //Read what is the path to game dir user entered
    window.api
      .getSelectGamesDir()
      .then((res) => {
        setFolderPath(res)
      })
      .catch((err) => {
        console.error('Error reading game directory:', err)
      })

    return () => (window.document.body.style.overflow = 'scroll')
  }, [])

  return (
    <div className="spellcaster__settings">
      <div className="settings__change-game-folder">
        <div
          className="change-game-folder__button"
          onClick={() =>
            window.api
              .showDialouge()
              .then((res) => {
                window.api.sendSelectedGamesDir(res.filePaths[0])
                setFolderPath(res.filePaths[0])
                setIsFirstInit(false)
              })
              .catch((err) => {
                console.error('Error selecting game directory:', err)
              })
          }
        >
          <span>Change Games Folder</span>
        </div>

        <h5>{folderPath}</h5>
      </div>
      {!isFirstInit && (
        <div className="settings__close" onClick={() => setShowSetting(false)}>
          <MdOutlineClose style={{ width: '50%', height: '50%', color: 'white' }} />
        </div>
      )}
    </div>
  )
}

export default Settings
