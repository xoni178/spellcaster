import './user.css'

//Images
import AvatarImg from '../../assets/avatar_full.jpg'

const User = () => {
  return (
    <div className="title-bar__user">
      <div className="user__avatar">
        <img src={AvatarImg} alt="avatar" />
      </div>
      <div className="user__username">
        <span>egzoni805</span>
      </div>
    </div>
  )
}

export default User
