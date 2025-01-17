import Ura from 'ura';
import events from '../../services/events.js';
import {playGame} from './utils/client.js'

const [render, State] = Ura.init();
const [getData, setData] = State(0);

events.add("setPongData", (data) => {
  data = data[0];
  console.log("set pong data to ", data);
  playGame(data.user_id, JSON.stringify(data.game), false, false);
})

function Pong(props = {}) {

  return render(() => (
    <root>
      <canvas id="gameCanvas"></canvas>
    </root>
  ));
}

export default Pong;
