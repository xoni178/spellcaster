import './libraryHome.css'

//Context
import { useGameDataContext } from '../../../DataContext/DataContext'

import LibraryGameHeader from '../../LibraryGameHeader/LibraryGameHeader'
const LibraryHome = ({ setClickedGameIconIndex, setIsLibraryHome }) => {
  const { gamesData } = useGameDataContext()

  const handleGameIconOnClick = (index) => {
    setIsLibraryHome(false)
    setClickedGameIconIndex(index)
  }

  return (
    <div className="game-library__home">
      <div className="home__body">
        {gamesData &&
          gamesData.map((gameData, index) => {
            return (
              <LibraryGameHeader
                key={index}
                gameID={gameData.gameID}
                onClick={() => handleGameIconOnClick(index)}
              />
            )
          })}
      </div>
    </div>
  )
}

export default LibraryHome
