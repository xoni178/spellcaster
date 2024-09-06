import { useState, useEffect, useRef } from 'react'
import './progressBar.css'

//Icons
import achievementsIcon_Achieved from '../../../../assets/icons/achievements-trophy-achieved.png'

const ProgressBar = ({ achievementsNumbers }) => {
  const [achievementPrecent, setAchievementPercent] = useState(0)
  const [sizeTrophieIcon, setSizeTrophieIcon] = useState(false)

  const ProgressBarRef = useRef(null)

  const percentage = (partialValue, totalValue) => {
    if (partialValue === undefined || partialValue === null || !totalValue) {
      setAchievementPercent(0)
      return
    }
    const percent = (100 * partialValue) / totalValue

    setAchievementPercent(percent.toFixed(2))
  }

  useEffect(() => {
    percentage(achievementsNumbers?.unlocked, achievementsNumbers?.all)
  }, [achievementsNumbers])

  useEffect(() => {
    if (ProgressBarRef.current) {
      if (ProgressBarRef.current.offsetWidth >= 800) {
        setSizeTrophieIcon(true)
      } else {
        setSizeTrophieIcon(false)
      }
    }
  }, [])

  return (
    <div className="header__progress-bar" style={{ position: 'relative' }} ref={ProgressBarRef}>
      {achievementPrecent === 100 ? (
        <div
          style={{
            position: 'absolute',
            top: `${sizeTrophieIcon ? -60 : -50}%`,
            right: `${sizeTrophieIcon ? -12 : -18}%`,
            width: `${sizeTrophieIcon ? 110 : 80}px`,
            height: `${sizeTrophieIcon ? 110 : 80}px`
          }}
        >
          <img style={{ width: '100%', height: '100%' }} src={achievementsIcon_Achieved} />
        </div>
      ) : null}
      <div className="progress-bar__text-container">
        <p>
          You have unlocked {achievementsNumbers?.unlocked}/{achievementsNumbers?.all}
        </p>
        <span>({achievementPrecent}%)</span>
      </div>
      <div className="progress-bar__progress-bar-empty">
        <div
          className="progress-bar__progress-bar-full"
          style={{ width: `${achievementPrecent}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar
