import Ura from 'ura';
import { playGame } from './client.js';
import api from '../../services/api.js';
import Navbar from '../../components/Navbar.js';

// TODO: check query if is in friend and exsits etc ...
function Game() {
  const { id } = Ura.getQueries();
  api.openGameSocket(id);
  const [render, State] = Ura.init();
  const [getStart, setStart] = State(false);

  return render(() => (
    <root>
      <Navbar />
      <div if={getStart()} className="game">
        <div id="menu">
          <button id="play-local" onclick={() => playGame(true, false)}>Play Locally</button>
          <button id="play-local-ai" onclick={() => playGame(true, true)}>Play vs AI</button>
          <button id="play-remote" onclick={() => playGame(false, false)}>Play Remotely</button>
        </div>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
      </div>
      <else>
        <h1>Loading ...</h1>
      </else>
    </root>
  ));
}

export default Game;
