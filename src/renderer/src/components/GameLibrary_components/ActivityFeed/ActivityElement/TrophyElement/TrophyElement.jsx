import './trophyElement.css'

import TrophieComponent from '../../../TrophieComponent/TrophieComponent'

//avatar
import AvatarImg from '../../../../../assets/avatar_full.jpg'
const TrophyElement = ({ feedItem }) => {
  return (
    <div className="activity-element-trophy-element">
      <div className="body__profileInfo">
        <div className="profileInfo__profile">
          <div className="avatar-container">{AvatarImg && <img src={AvatarImg} />}</div>
          <p>egzoni805</p>
        </div>
        <span>achieved</span>
      </div>
      <TrophieComponent TrophyData={feedItem} TrophieComponentForm={0} />
    </div>
  )
}

export default TrophyElement
