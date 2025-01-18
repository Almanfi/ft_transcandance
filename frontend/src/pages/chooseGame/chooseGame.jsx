import Ura from 'ura';
import Navbar from '../../components/Navbar.js';

function ChooseGame(props = {}) {
  const [render, State] = Ura.init();

  return render(() => (
    <root>
      <Navbar />
      <div className="choosegame">
        <div className="thegame">
          <div className="title">
            <h3>Pong</h3>
          </div>
          <button onclick={() => Ura.navigate("/game?name=pong")} >Play</button>
        </div>
        <div className="thegame">
          <div className="title">
            <h3>Osnier</h3>
          </div>
          <button onclick={() => Ura.navigate("/game?name=osnier")}>Play</button>
        </div>
      </div>
    </root>
  ));
}

export default ChooseGame;
