import Ura from 'ura';
import events from '../../services/events.js';
import { playGame } from './utils/client.js'

const [render, State] = Ura.init();
const [getData, setData] = State(0);

events.add("setPongData", (arg) => {
  console.log("pong args ", arg);
  switch (arg[1]) {
    case "local": {
      playGame("", undefined, true, false);
      break;
    }
    case "remote": {
      let data = arg[0];
      playGame(data.user_id, JSON.stringify(data.game), false, false);
      break;
    }
    case "ai": {
      playGame("", undefined, true, true);
      break;
    }

    default:
      break;
  }
  

})

function Pong(props = {}) {

  return render(() => (
    <root>
      <canvas id="gameCanvas"></canvas>
    </root>
  ));
}

export default Pong;
