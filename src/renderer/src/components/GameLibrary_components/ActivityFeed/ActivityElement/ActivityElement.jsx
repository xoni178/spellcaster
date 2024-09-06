import { useState, useEffect } from 'react'
import './activityElement.css'

import TrophyElement from './TrophyElement/TrophyElement'
import NewsElement from './NewsElement/NewsElement'

const ActivityElement = ({ IsTropy, feedItem, imageSrc }) => {
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
    <div className="activity-feed__activity-element">
      <div className="activity-element__date-time">
        <div className="date-time__time">
          <p>
            {IsTropy
              ? convertTimestampToDate(feedItem?.achieved_time)
              : convertTimestampToDate(feedItem?.date)}
          </p>
        </div>
        <div className="date-time__line">
          <div id="line"></div>
        </div>
      </div>
      {IsTropy ? (
        <TrophyElement feedItem={feedItem} />
      ) : (
        <NewsElement feedItem={feedItem} imageSrc={imageSrc} />
      )}
    </div>
  )
}

export default ActivityElement
