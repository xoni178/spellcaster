import { useState, useEffect } from 'react'
import './playTab.css'

//Icons
import playTimeIcon from '../../../../assets/icons/clock_Icon.png'
import achievementsIcon from '../../../../assets/icons/achievements-trophy.png'
import achievementsIcon_Achieved from '../../../../assets/icons/achievements-trophy-achieved.png'
import playIcon from '../../../../assets/icons/play_Icon.png'
import dropDownIcon from '../../../../assets/icons/down-arrow_Icon.png'
import { IoMdCloseCircle } from 'react-icons/io'

//Context
import { useGameDataContext } from '../../../../DataContext/DataContext'

const PlayTab = ({ logoImageSrc, achievementsNumbers, clickedGameIconIndex }) => {
  const { gamesData, playedTimeData } = useGameDataContext()

  const [achievementPrecent, setAchievementPercent] = useState(0)

  const [playedTime, setPlayedTime] = useState('')
  const [lastPlayedDate, setLastPlayedDate] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExeFileSelected, setIsExeFileSelected] = useState(false)
  const [exeFileName, setExeFileName] = useState(null)
  const [exeFilePath, setExeFilePath] = useState(null)

  const percentage = (partialValue, totalValue) => {
    if (partialValue === undefined || partialValue === null || !totalValue) {
      setAchievementPercent(0)
      return
    }
    const percent = (100 * partialValue) / totalValue

    setAchievementPercent(percent.toFixed(2))
  }
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${String(hrs).padStart(2, '0')}.${mins} hours`
  }

  const handlePlayButtonClick = () => {
    if (!exeFilePath) return

    if (!isPlaying && exeFileName) {
      window.ipc.send('execute-game', { exeFilePath, exeFileName })
    }
  }

  const handleStopPlayButtonClick = () => {
    if (isPlaying && exeFileName) {
      window.ipc.send('close-game', exeFileName)
    }
  }

  useEffect(() => {
    percentage(achievementsNumbers?.unlocked, achievementsNumbers?.all)
  }, [achievementsNumbers])

  useEffect(() => {
    if (!playedTimeData) {
      setPlayedTime('00:00')
      setLastPlayedDate('')
      setIsPlaying(false)
      setIsExeFileSelected(false)
      setExeFilePath(null)
      setExeFileName(null)
      return
    }

    const gameID = gamesData[clickedGameIconIndex].gameID
    const gamePlayedTimeData = playedTimeData.find((object) =>
      Object.keys(object).includes(String(gameID))
    )
    console.log(playedTimeData, gameID, gamePlayedTimeData)
    if (!gamePlayedTimeData) {
      setIsExeFileSelected(false)
      setPlayedTime('00:00')
      setLastPlayedDate('')
      setIsPlaying(false)
      setExeFilePath(null)
      setExeFileName(null)
      return
    }
    setIsExeFileSelected(true)
    setPlayedTime(formatTime(gamePlayedTimeData[gameID].playedTimeSeconds))
    setLastPlayedDate(gamePlayedTimeData[gameID].lastDatePlayed)
    setIsPlaying(gamePlayedTimeData[gameID].isPlaying)
    setExeFilePath(gamePlayedTimeData[gameID].exeFilePath)
    setExeFileName(gamePlayedTimeData[gameID].exeFileName)
  }, [playedTimeData, clickedGameIconIndex])

  const handleOptionsButtonClick = async (index) => {
    let exeFileObj = {}

    const exeFile = await window.ipc.invoke('select-exe-file')
    const gameID = gamesData[index].gameID

    exeFileObj[gameID] = {
      exeFileName: exeFile.fileName,
      exeFilePath: exeFile.filePath,
      playedTimeSeconds: 0
    }

    window.ipc.send('save-exeFileName', exeFileObj)
  }

  return (
    <div className="game-hero__play-tab">
      <div className="play-tab__title">{logoImageSrc && <img src={logoImageSrc} alt="logo" />}</div>
      <div className="play-tab__play-banner">
        <div className="play-banner__buttons">
          {isPlaying ? (
            <div className="buttons___play-button" onClick={() => handleStopPlayButtonClick()}>
              <IoMdCloseCircle />
              <p>Playing...</p>
            </div>
          ) : (
            <div className="buttons___play-button" onClick={() => handlePlayButtonClick()}>
              <img src={playIcon} alt="playIcon" />
              <p>Play</p>
            </div>
          )}

          <div
            className="buttons__options"
            onClick={() => handleOptionsButtonClick(clickedGameIconIndex)}
            style={{ background: `${isExeFileSelected ? '#d15825' : 'gray'}` }}
          >
            <img src={dropDownIcon} alt="drop-down" />
          </div>
        </div>
        <div className="play-banner__game-details">
          <div className="game-details__last-played">
            <p>Last played</p>
            <span>{lastPlayedDate}</span>
          </div>
          <div className="game-details__play-time">
            <img src={playTimeIcon} alt="play-time-icon" />
            <div className="container">
              <p>Play Time</p>
              <span>{playedTime}</span>
            </div>
          </div>
          <div className="game-detials__achievements-progress">
            <img
              src={achievementPrecent === 100 ? achievementsIcon_Achieved : achievementsIcon}
              alt="achievements-trophy"
            />
            <div className="container">
              <p>Achievements</p>
              <div className="achievements-progress__progress-bar">
                <span>
                  {achievementsNumbers?.unlocked}/{achievementsNumbers?.all}
                </span>
                <div className="progress-bar__bar">
                  <div className="achieved" style={{ width: `${achievementPrecent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayTab
