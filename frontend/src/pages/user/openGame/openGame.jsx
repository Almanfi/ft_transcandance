import Ura from 'ura';
import api from '../../../services/api.js';

const [render, State] = Ura.init();
const GameState = State([]);
const [getter, setter] = GameState;

function OpenGame(props = {}) {

  const accept = async (id) => {
    try {
      const invite = await api.acceptGameInvite(id);
      console.log(invite);
      Ura.navigate(`/game?id=${invite.game.id}`);
    } catch (error) {
      api.handleError(error)
    }

  }

  const refuse = async (id) => {
    await api.refuseGameInvite(id)
  }


  return render(() => (
    <div className="opengame">
      <h3>Game states</h3>
      <loop on={getter()}>
        {(e) => (
          <>
            <button onclick={() => accept(e)}> accept ({e})</button>
            {"   "}
            <button onclick={() => refuse(e)}> refuse ({e})</button>
            <br />
            -----------------------------------------------------
            <br />
          </>
        )}
      </loop>
    </div>
  ));
}

export default OpenGame;
export { GameState };