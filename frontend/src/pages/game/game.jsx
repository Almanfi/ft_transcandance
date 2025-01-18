import Ura from 'ura';
import { playGame, game_over, game_cancel } from '../pong/utils/client.js';
import api from '../../services/api.jsx';
import Navbar from '../../components/Navbar.jsx';
import Toast from '../../components/Toast.jsx';
import events from '../../services/events.js';

// TODO: check query if is in friend and exsits etc ...
function Game() {
  const { id, tournament_id, name } = Ura.getQueries();
  if (!["pong", "osnier"].includes(name)) {
    Ura.create(<Toast message={`Invalid game ${name}`} />);
    return Ura.navigate("/choosegame")
  }
  const [render, State] = Ura.init(); 0
  const [getMatchLoading, setMatchLoading] = State(false);
  const [getTournLoading, setTournLoading] = State(false);
  const [getType, setType] = State("");



  function handleGoToPongGame(e) {
    const data = JSON.parse(e.data);
    if (data['type'] === 'game.start') {
      Ura.navigate("/pong");
      events.emit("setPongData", data, "remote");
    }
  }

  function handleGoToOsnier(e)
  {
    const data = JSON.parse(e.data);
    if (data['type'] === 'game.start') {
      // Ura.navigate("/pong");
      // events.emit("setPongData", data, "hello world");
      console.log("Lobby Ready for Osnier");
    }
  }

  function handleGoToGameLobby(game_id) {
    const game_socket = api.openGameSocket(game_id);
    if (name === "pong")
      game_socket.onmessage = handleGoToPongGame;
    else if (name === "osnier")
      game_socket.onmessage = handleGoToOsnier;
  }

  function handleOpenMatchMaking() {
    if (!getTournLoading()) {
      setMatchLoading(!getMatchLoading())
      const matchmaking = api.openGameMatchMakingSocket(name);
      matchmaking.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data['type'] === "game.launch")
          handleGoToGameLobby(data['game_id']);
      }
    }
    else {
      api.closeGameMatchMakingSocket();
    }
  }

  function handleTournamentLobby(tournament_id) {
    const tournament_socket = api.openTournamentSocket(tournament_id);
    tournament_socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("The tournament Lobby data here is: ", data)
      if (data['type'] === "game.lobby.start")
        handleGoToGameLobby(data['game_id']);
    };
  }

  function handleTournament() {
    if (!getMatchLoading()) {
      setTournLoading(!getTournLoading())
      const Tourmaking = api.openGameTournamentMakingSocket(name);
      Tourmaking.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data['type'] === "tournament.found")
          handleTournamentLobby(data['tournament_id']);
      }
    }
    else {
      api.closeGameTournamentMakingSocket()
    }
  }
  if (tournament_id !== undefined)
    handleTournamentLobby(tournament_id)

  const handleType = (type) => {
    if (getType() === type) setType("");
    else if (getType() === "") {
      setType(type);
      if (name === "pong") {
        switch (type) {
          case "match making":
            handleOpenMatchMaking();
            break;
          case "tournament":
            handleTournament();
            break
          case "vs ai": {
            Ura.navigate("/pong");
            events.emit("setPongData", undefined, "ai");
            break;
          }
          case "localy": {
            Ura.navigate("/pong");
            events.emit("setPongData", undefined, "local");
            break;
          }
          default:
            break;
        }
      }
      else if (name === "osnier") {
        //
      }
    }
  };

  return render(() => (
    <root>
      <Navbar />
      {/* <h3>Game: {name}</h3> */}
      {/* <div if={getStart()} className="game" id="game-play">
        <div id="menu">
          <button id="play-local" onclick={() => playGame("", undefined, true, false)}>Play Locally</button>
          <button id="play-local-ai" onclick={() => playGame("", undefined, true, true)}>Play vs AI</button>
          <button id="play-remote" style={{ backgroundColor: getColor() }} onclick={() => playRemote()}>{getValue()}</button>
          <button id="play-tournament" onclick={() => playTournament()}>Play Tournament</button>
  
        </div>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
      </div> */}
      <div className="start">
        <div className="type" onclick={() => handleType("match making")}>
          <h3 >Match making </h3>
          <h3 if={getType() === "match making"}>loading ... (clique to cancel)</h3>
        </div>

        <div className="type" onclick={() => handleType("tournament")}>
          <h3 >Tournament </h3>
          <h3 if={getType() === "tournament"}>loading ... (clique to cancel)</h3>
        </div>

        <div if={name === "pong"} className="type" onclick={() => handleType("vs ai")}>
          <h3 >Play vs AI </h3>
          <h3 if={getType() === "vs ai"}>loading ... (clique to cancel)</h3>
        </div>

        <div if={name === "pong"} className="type" onclick={() => handleType("localy")}>
          <h3 >Play localy </h3>
          <h3 if={getType() === "localy"}>loading ... (clique to cancel)</h3>
        </div>

      </div>

      {/* <div if={getLoading() && !getStart()} className="loading">
          <button onclick={() => setStart(true)}>
            clique me
          </button>
        </div> */}
    </root>
  ));
}



export default Game;