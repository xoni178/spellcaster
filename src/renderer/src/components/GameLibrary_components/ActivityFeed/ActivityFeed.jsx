import { useEffect, useState } from 'react'
import './activityFeed.css'

import ActivityElement from './ActivityElement/ActivityElement'
import { useGameDataContext } from '../../../DataContext/DataContext'

const ActivityFeed = ({ clickedGameIconIndex }) => {
  const { libraryCachePath, allGamesImagesData, gamesData, allGamesAchievements } =
    useGameDataContext()

  const [feedItems, setFeedItems] = useState([])
  const [newsItems, setNewsItems] = useState([])
  const [numberOfNewsItems, setNumberOfNewsItems] = useState(10)
  const [oldClickedIndex, setOldClickedIndex] = useState(null)

  const [imageSrc, setImageSrc] = useState(null)

  const fetchNewsData = async (gameID) => {
    const newsItems = await window.ipc.invoke('request-activity', {
      gameID,
      numberOfNews: numberOfNewsItems
    })

    return newsItems
  }

  const getCompleteActivityFeed = async (gameID) => {
    let feedItems = []
    let unsortedfeedItems

    const news = await fetchNewsData(gameID)

    if (!news) {
      setFeedItems([])
      return
    }

    setNewsItems(news)

    if (allGamesAchievements.length !== 0 && allGamesAchievements) {
      const allGameAchievements = allGamesAchievements.find((gameAchievements) =>
        Object.keys(gameAchievements).includes(gameID)
      )

      if (allGameAchievements) {
        const achievements = allGameAchievements[gameID].filter(
          (gameAchievements) => gameAchievements.achieved === true
        )

        if (news) {
          unsortedfeedItems = [...achievements, ...news]
        } else {
          unsortedfeedItems = achievements
        }
      } else {
        if (news) setFeedItems(news)
      }
    }

    if (!unsortedfeedItems) return

    console.log('unsorted: ', unsortedfeedItems)
    for (var i = 0; i < unsortedfeedItems.length; i++) {
      let obj
      let value = 0

      for (var j = 0; j < unsortedfeedItems.length; j++) {
        if ('gid' in unsortedfeedItems[j]) {
          if (unsortedfeedItems[j]?.date > value) {
            const existsInFeeditems = feedItems.find(
              (feedItem) => feedItem?.gid === unsortedfeedItems[j]?.gid
            )

            if (!existsInFeeditems) {
              value = unsortedfeedItems[j]?.achieved_time
              obj = unsortedfeedItems[j]
            }
          }
        } else {
          if (unsortedfeedItems[j]?.achieved_time > value) {
            const existsInFeeditems = feedItems.find(
              (feedItem) => feedItem?.name === unsortedfeedItems[j]?.name
            )

            if (!existsInFeeditems) {
              value = unsortedfeedItems[j]?.achieved_time
              obj = unsortedfeedItems[j]
            }
          }
        }
      }

      if (!obj) break

      feedItems.push(obj)
    }

    setFeedItems(feedItems)
  }

  useEffect(() => {
    if (allGamesImagesData.length === 0 || libraryCachePath === '') {
      return
    }

    if (imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }

    const gameID = gamesData[clickedGameIconIndex].gameID

    const gameImagesData = allGamesImagesData.find(
      (gameImageData) => gameImageData.gameID === gameID
    )

    if (gameImagesData) {
      const path = `${libraryCachePath}\\${gameImagesData?.imageNames?.header_name}`
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

      // Cleanup function to revoke object URLs
      return () => {
        if (imageSrc) {
          URL.revokeObjectURL(imageSrc)
        }
      }
    }
  }, [allGamesImagesData, clickedGameIconIndex])

  useEffect(() => {
    if (clickedGameIconIndex === null && gamesData.length === 0) return

    if (oldClickedIndex === null) setOldClickedIndex(clickedGameIconIndex)
    else if (oldClickedIndex !== null && oldClickedIndex !== clickedGameIconIndex) {
      setNumberOfNewsItems(10)
      setOldClickedIndex(clickedGameIconIndex)
    }

    const gameID = gamesData[clickedGameIconIndex].gameID

    getCompleteActivityFeed(gameID)

    setOldClickedIndex(clickedGameIconIndex)
  }, [clickedGameIconIndex, numberOfNewsItems, allGamesAchievements])

  return (
    <div className="game-library__activity-feed">
      {feedItems &&
        feedItems.map((feedItem, index) => {
          if ('gid' in feedItem) {
            return (
              <ActivityElement
                key={index}
                IsTropy={false}
                feedItem={feedItem}
                imageSrc={imageSrc}
              />
            )
          } else {
            return (
              <ActivityElement key={index} IsTropy={true} feedItem={feedItem} imageSrc={imageSrc} />
            )
          }
        })}
      {newsItems && newsItems.length >= numberOfNewsItems ? (
        <div
          className="activity-feed__load-more-bttn"
          onClick={() => setNumberOfNewsItems(numberOfNewsItems * 2)}
        >
          <p>Load More Activity</p>
        </div>
      ) : null}
    </div>
  )
}

export default ActivityFeed
