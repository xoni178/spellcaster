import { useState, useEffect, useRef } from 'react'
import { GameLibrary, TitleBar } from './container'
import { Settings, AddGameWindow } from './components'

import './app.css'
function App() {
  const [showSettings, setShowSetting] = useState(false)
  const [showAddGame, setShowAddGame] = useState(false)
  const [isFirstInit, setIsFirstInit] = useState(false)

  const appRef = useRef(null)

  useEffect(() => {
    if (appRef.current) {
      appRef.current.style.height = `${document.body.clientHeight}px`
    }
  }, [document.body.clientHeight])

  useEffect(() => {
    window.document.body.style.overflow = 'scroll'
    window.api.isFirstAppInit((msg) => {
      setIsFirstInit(msg)
    })
  }, [])

  useEffect(() => {
    if (isFirstInit == true) {
      setShowSetting(true)
    }
  }, [isFirstInit])

  return (
    <div className="spellcaster">
      <TitleBar />
      <GameLibrary
        setShowSetting={(val) => setShowSetting(val)}
        setShowAddGame={(val) => setShowAddGame(val)}
      />
      {showSettings && (
        <Settings
          setShowSetting={(val) => setShowSetting(val)}
          isFirstInit={isFirstInit}
          setIsFirstInit={(val) => setIsFirstInit(val)}
        />
      )}
      {showAddGame && <AddGameWindow setShowAddGame={(val) => setShowAddGame(val)} />}
    </div>
  )
}

export default App
