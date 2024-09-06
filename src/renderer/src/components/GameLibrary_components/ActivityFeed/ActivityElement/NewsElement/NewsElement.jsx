import { useState } from 'react'
import './newsElement.css'

const NewsElement = ({ feedItem, imageSrc }) => {
  const cleanTheContentsText = (text) => {
    const removeSquareBrackets = /\[.*?\]/g
    const removeCurlyBrackets = /\{.*?\}/g
    const removeImageSrc = /(?:[^\s]+)(?:\.jpg|\.jpeg|\.png|\.gif|\.bmp|\.webp)/gi

    const cleaned1 = text.replace(removeSquareBrackets, '')
    const cleand2 = cleaned1.replace(removeCurlyBrackets, '')
    const cleand3 = cleand2.replace(removeImageSrc, '')

    return cleand3 + '...'
  }
  return (
    <div
      className="activity-element__news-element"
      onClick={() => window.ipc.openLinkToNewWindow(feedItem?.url)}
    >
      <div className="news-element__photo-container">
        {imageSrc && <img src={imageSrc} alt="news_header"></img>}
      </div>
      <div className="news-element__text-container">
        <div className="text-container__title">{feedItem?.title}</div>
        <div className="text-container__desc">
          {cleanTheContentsText(feedItem?.contents.slice(0, 233))}
        </div>
      </div>
    </div>
  )
}

export default NewsElement
