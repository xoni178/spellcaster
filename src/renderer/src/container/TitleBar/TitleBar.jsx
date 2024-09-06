import './titleBar.css'

import { WindowsButtons, User } from '../../components'

const TitleBar = () => {
  return (
    <div className="spellcaster__title-bar">
      <div className="title-bar__left-container">
        <User />
      </div>
      <WindowsButtons />
    </div>
  )
}

export default TitleBar
