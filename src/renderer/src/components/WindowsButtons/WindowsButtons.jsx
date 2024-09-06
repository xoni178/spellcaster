//Icons
import { IoClose } from 'react-icons/io5'
import { FaMinus } from 'react-icons/fa6'

import './windowsButtons.css'

const WindowsButtons = () => {
  return (
    <div className="title-bar__windowsButtons">
      <div className="windowsButtons__minimize" onClick={() => window.ipc.send('minimize-app')}>
        <FaMinus style={{ width: '12px', height: '12px' }} />
      </div>
      <div className="windowsButtons__close" onClick={() => window.ipc.send('close-app')}>
        <IoClose />
      </div>
    </div>
  )
}

export default WindowsButtons
