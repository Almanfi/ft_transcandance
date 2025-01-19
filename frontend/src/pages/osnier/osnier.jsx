import Ura from 'ura';
import { startGame } from './start.js'
import events from '../../services/events.js';
import api from '../../services/api.js';

const [render, State] = Ura.init();
const [getData, setData] = State(0);

events.add("setOsnierData", async (arg) => {
  let convasDiv = document.getElementById("osnier");
  if (convasDiv)
    convasDiv.innerHTML = "";
  switch (arg[1]) {
    case "remote": {
      let data = arg[0];
      let gameData = data.game;
      const userData = await api.getUser();
      Ura.refresh();
      startGame(userData, gameData);
      break;
    }
    default:
      break;
  }
})

function Osnier(props = {}) {

  return render(() => (
    <root>
      <div id="osnier" style="position: relative; display: flex;"></div>
    </root>
  ));
}

export default Osnier;