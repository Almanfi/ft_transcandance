import Ura from 'ura';
import { playGame, game_over, game_cancel } from './client.js';
import api from '../../services/api.jsx';
import Navbar from '../../components/Navbar.jsx';
import Toast from '../../components/Toast.jsx';

// TODO: check query if is in friend and exsits etc ...
function Game() {
  const { id, name } = Ura.getQueries();
  if (!["pong", "osnier"].includes(name)) {
    Ura.create(<Toast message={`Invalid game ${name}`} />);
    return Ura.navigate("/choosegame")
  }
  // api.openGameSocket(id);
  const [render, State] = Ura.init(); 0
  const [getColor, setColor] = State("#4CAF50");
  const [getValue, setValue] = State("Play game");
  const [getStart, setStart] = State(false);
  const [getMatchLoading, setMatchLoading] = State(false);
  const [getTournLoading, setTournLoading] = State(false);

  //const [getStart, setStart] = State(false);


  let waiting = false;
  let cancel_search = false;

  function playRemote() {
    if (waiting) {
      cancel_search = true;
      //waiting = false;
      return;
    }
    cancel_search = false;

    setColor("red");
    setValue("Cancel game")
    waiting = true;

    let game_id = undefined;

    let last_match_time = undefined;
    let match_socket = undefined;
    let lobby_socket = undefined;
    let lobby_enter_time = undefined;
    let started_game = false;


    function reset() {
      if (match_socket !== undefined && match_socket.readyState != WebSocket.CLOSED)
        match_socket.close();
      if (lobby_socket !== undefined && lobby_socket.readyState != WebSocket.CLOSED)
        lobby_socket.close();
      match_socket = lobby_socket = undefined;
      game_id = undefined;
      last_match_time = undefined;
      started_game = false;
      lobby_enter_time = undefined;
    }
    reset();
    function tick(time) {
      if (started_game && game_over) {
        if (!game_cancel)
          cancel_search = true;
        reset();
      }
      if (started_game) {
        requestAnimationFrame(tick);
        return;
      }
      if (game_id === undefined && lobby_socket !== undefined) {
        lobby_socket.close();
        lobby_socket = undefined;
        lobby_enter_time = undefined;
      }
      if (lobby_enter_time !== undefined
        && Date.now() - lobby_enter_time > 3000) {
        reset();
      }
      if (cancel_search) {
        console.log("CANCELLING SEARCH!");
        reset();
        cancel_search = false;
        waiting = false;
        setColor("#4CAF50");
        setValue("Play game")
        return;
      }

      if (game_id === undefined) {
        if ((match_socket === undefined || match_socket.readyState === WebSocket.CLOSED)
          && (last_match_time === undefined
            || Date.now() - last_match_time > 1000)) {
          last_match_time = Date.now();
          match_socket = new WebSocket(`${api.websocketApi}/ws/matchmaking/pong/`);

          match_socket.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "game.launch") {
              game_id = data.game_id;
            }
            console.log("[MATCHMAKING SOCKET] RECEVIED: ", e.data);
          };

          match_socket.onopen = (e) => {
            console.log("[MATCHMAKING SOCKET] CONNECTED");
          };

          match_socket.onclose = (e) => {
            console.log("[MATCHMAKING SOCKET] DISCONNECTED ");
          };
        }
      }
      else {
        if (lobby_socket === undefined ||
          (lobby_socket.readyState === WebSocket.CLOSED && !started_game)) {
          lobby_socket = new WebSocket(`${api.websocketApi}/ws/game/${game_id}/`);
          lobby_socket.onopen = (e) => {
            console.log("[LOBBY SOCKET] CONNECTED!");
            lobby_enter_time = Date.now();
          };

          lobby_socket.onmessage = (e) => {
            console.log("[LOBBY SOCKET] RECEIVED ", e);
            const data = JSON.parse(e.data);
            if (data.type === "game.start") {
              started_game = true;

              playGame(data.user_id, JSON.stringify(data.game), false, false);
            }
          };
          lobby_socket.onclose = (e) => {
            console.log("[LOBBY SOCKET] DISCONNECTED ", e);
          };
        }
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function playTournament() {
    const socket = new WebSocket(`${api.websocketApi}/ws/tournamentmaking/`);
    let tournament_id = undefined;

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "tournament.found" && typeof data.tournament_id === "string") {
        tournament_id = data.tournament_id;
      }
      console.log("[TOURNAMENTMAKING SOCKET] RECEVIED: ", e.data);
    };

    socket.onopen = (e) => {
      console.log("[TOURNAMENTMAKING SOCKET] CONNECTED");
      //socket.send(JSON.stringify({ message: "hello!" }));
    };

    socket.onclose = (e) => {
      console.log("[TOURNAMENTMAKING SOCKET] DISCONNECTED ", e);
    };
    let lobby_socket = undefined;

    function tick(time) {
      if (tournament_id !== undefined) {
        if (lobby_socket === undefined) {
          lobby_socket = new WebSocket(`${api.websocketApi}/ws/tournament/${tournament_id}/`);
          lobby_socket.onopen = (e) => {
            console.log("[TOURNAMENT_LOBBY SOCKET] CONNECTED!");
          };

          lobby_socket.onmessage = (e) => {
            console.log("[TOURNAMENT_LOBBY SOCKET] RECEIVED ", e);

            const data = JSON.parse(e.data);
            if (data.type === "lobby.matches") {
              console.log("[TOURNAMENT_LOBBY SOCKET] MATCHES ", (data.matches.length));
              for (let i = 0; i < data.matches.length; i++) {
                console.log(`[MATCH ${i}] ${JSON.stringify(data.matches[i])}`);
              }
            }
          };
          lobby_socket.onclose = (e) => {
            console.log("[TOURNAMENT_LOBBY SOCKET] DISCONNECTED ", e);
          };
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

  }

  function handleGoToPongGame(e) {
    const data = JSON.parse(e.data);
    if (data['type'] === 'game.start') {
      console.log("Both Players are in Lobby");
    }
  }

  function handleOpenMatchMaking() {
    if (!getTournLoading()) {
      setMatchLoading(!getMatchLoading())
      const matchmaking = api.openPongMatchMakingSocket();
      matchmaking.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data['type'] === "game.launch") {
          const game_socket = api.openGameSocket(data['game_id']);
          game_socket.onmessage = handleGoToPongGame;
        }
      }
    }
    else {
      api.closePongMatchMakingSocket();
    }
  }

  function handleTournament() {
    if (!getMatchLoading()) {
      setTournLoading(!getTournLoading())
      const Tourmaking = api.openPongTournamentMakingSocket();
      Tourmaking.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data['type'] === "game.launch") {
          const game_socket = api.openGameSocket(data['game_id']);
          game_socket.onmessage = handleGoToPongGame;
        }
      }
    }
    else{
      api.closePongTournamentSocket()
    }
  }
}

return render(() => (
  <root>
    <Navbar />
    <div if={getStart()} className="game" id="game-play">
      <div id="menu">
        <button id="play-local" onclick={() => playGame("", undefined, true, false)}>Play Locally</button>
        <button id="play-local-ai" onclick={() => playGame("", undefined, true, true)}>Play vs AI</button>
        <button id="play-remote" style={{ backgroundColor: getColor() }} onclick={() => playRemote()}>{getValue()}</button>
        <button id="play-tournament" onclick={() => playTournament()}>Play Tournament</button>

      </div>
      <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>
    <div className="start">
      <div className="type" onclick={handleOpenMatchMaking}>
        <h3 if={!getMatchLoading()}>Match making </h3>
        <h1 if={getMatchLoading()}>Match making loading ... (clique to cancel)</h1>
      </div>

      <div className="type" onclick={handleTournament}>
        <h3 if={!getTournLoading()}>Tournament </h3>
        <h1 if={getTournLoading()}>Tournament  loading ... (clique to cancel)</h1>
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