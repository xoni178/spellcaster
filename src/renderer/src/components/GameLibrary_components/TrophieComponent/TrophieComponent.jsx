import { useState, useEffect, useRef } from 'react'
import './trophieComponent.css'

//Icons
import QuestionMark from '../../../assets/Question-mark.jpg'

const TrophieComponent = ({ TrophyData, TrophieComponentForm }) => {
  const [imageSrc, setImageSrc] = useState('')
  const [displayUnlockedTime, setDisplayUnlockedTime] = useState(false)

  const [rareBorder, setRareBorder] = useState(null)

  const TrophyComponentRef = useRef(null)

  useEffect(() => {
    if (!TrophyData) return
    if (!TrophyData.icon) return
    if (!TrophyData.icon_gray) return

    if (TrophyData?.percent <= 10) {
      setRareBorder('2px solid gold')
    } else {
      setRareBorder(null)
    }

    const trophyIconsPATH = 'C:\\Users\\egzon\\AppData\\Roaming\\spellcaster\\AchievementsCache'
    if (TrophieComponentForm == 0) {
      const path = `${trophyIconsPATH}\\${TrophyData?.icon}`

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
    } else if (TrophieComponentForm === 1) {
      const path = `${trophyIconsPATH}\\${TrophyData?.icon_gray}`

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
    }

    // Cleanup function to revoke object URLs
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [TrophyData])

  useEffect(() => {
    if (TrophyComponentRef.current) {
      if (TrophyComponentRef.current.offsetWidth >= 850) {
        setDisplayUnlockedTime(true)
      } else {
        setDisplayUnlockedTime(false)
      }
    }
  }, [])

  const convertTimestampToDate = (timestamp) => {
    let monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const date = new Date(timestamp * 1000)

    const seconds = '0' + date.getSeconds()
    const minutes = '0' + date.getMinutes()
    const hours = '0' + date.getHours()

    const dayOfWeekNumber = date.getDay()
    const dayOfWeek = daysOfWeek[dayOfWeekNumber]

    const monthNumber = date.getMonth()
    const mounthName = monthNames[monthNumber]

    const year = date.getFullYear()
    const dateDay = date.getDate()

    var formattedTime = `${dayOfWeek} ${mounthName} ${dateDay} ${year} ${hours.slice(-2)}:${minutes.slice(-2)}:${seconds.slice(-2)}`

    return formattedTime
  }

  return (
    <div className="trophy-component" ref={TrophyComponentRef}>
      {TrophieComponentForm !== 2 ? (
        <>
          <div className="trophy-component__body">
            <div className="body__icon-container" style={{ border: rareBorder }}>
              {imageSrc && <img src={imageSrc} alt="icon"></img>}
            </div>
            <div className="body__text">
              <p className="text__title">{TrophyData && TrophyData.displayName}</p>
              <p className="text__desc">{TrophyData && TrophyData.description}</p>
              <p className="text__percentage">
                {TrophyData && TrophyData.percent.toFixed(2)}% of players have this achievement
              </p>
            </div>
          </div>

          {displayUnlockedTime && TrophyData.achieved_time !== 0 ? (
            <div
              style={{
                minWidth: '210px',
                width: '210px',
                display: 'flex',
                alingItems: 'center',
                justifyContent: 'center'
              }}
            >
              <p style={{ fontSize: '10px', color: 'white', opacity: '0.35' }}>
                Unlocked: {convertTimestampToDate(TrophyData.achieved_time)}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="body__icon-container">
            <img src={QuestionMark} alt="hidden-icon" />
          </div>
          <div className="trophy-component__text">
            <p className="text__title">{TrophyData} Hidden Achievements remaining</p>
          </div>
        </>
      )}
    </div>
  )
}

export default TrophieComponent
