import Ura from 'ura';
import { playGame } from './client.js';
import api from '../../services/api.jsx';
import Navbar from '../../components/Navbar.jsx';

// TODO: check query if is in friend and exsits etc ...
function Game() {
  const { id } = Ura.getQueries();
  // api.openGameSocket(id);
  const [render, State] = Ura.init();
  const [getColor, setColor] = State("#4CAF50");
  const [getValue, setValue] = State("Play game");

  //const [getStart, setStart] = State(false);
  const websocketApi = "http://localhost:8001";

  let user = undefined;

  // TODO: remove this!!
  const fetchData = async () => {
    try {
      user = await api.getUser();
    } catch (error) {
      //console.log("it went through here:", error)
      api.handleError(error)
    }
  }
  fetchData();

  let waiting = false;
  let cancel_search = false;

  function playRemote() {
    if (waiting) {
      cancel_search = true;
      //waiting = false;
      return;
    }
    console.error("set color red");
    setColor("red");
    setValue("Cancel game")
    waiting = true;

    // const button = document.getElementById("play-remote");
    // let prev_style = button.style.backgroundColor;


    // button.style.backgroundColor = "red";

    const socket = new WebSocket(`${websocketApi}/ws/matchmaking/`);
    let in_matchmaking = false;
    let game_id = "";


    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message === "Entered Game Matchmaking") {
        in_matchmaking = true;
      }
      else if (data.type === "game.launch") {
        if (typeof data.type === "string") {
          game_id = data.game_id;
          console.log(`[MATCHMAKING SOCKET] JOINED GAME ${game_id}`);
        }
      }
      console.log("[MATCHMAKING SOCKET] RECEVIED: ", e.data);
    };

    socket.onopen = (e) => {
      console.log("[MATCHMAKING SOCKET] CONNECTED");
      //socket.send(JSON.stringify({ message: "hello!" }));
    };

    socket.onclose = (e) => {
      if (game_id.length === 0) {
        // TODO: try again?
        console.log("[MATCHMAKING SOCKET] FAILED MATCHMAKING!");
      }
      console.log("[MATCHMAKING SOCKET] DISCONNECTED ", e);
    };
    let lobby_socket = undefined;
    let game_started = false;
    let game_socket = undefined;



    // TODO: remove this trash code
    function tick(time) {
      if (cancel_search) {
        console.log("CANCELLING SEARCH!");
        socket.close();
        cancel_search = false;
        waiting = false;
        setColor("#4CAF50");
        setValue("Play game")
        return;
      }
      if (game_id.length !== 0) {
        if (lobby_socket === undefined) {
          lobby_socket = new WebSocket(`${websocketApi}/ws/game/${game_id}/`);
          lobby_socket.onopen = (e) => {
            console.log("[LOBBY SOCKET] CONNECTED!");
          };

          lobby_socket.onmessage = (e) => {
            console.log("[LOBBY SOCKET] RECEIVED ", e);
            const data = JSON.parse(e.data);
            if (data.type === "game.start") {
              playGame(user.id, JSON.stringify(data.game), false, false);
              return;
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
    //console.error("set color gree");
    
   
    //button.style.backgroundColor = prev_style;
  }

  return render(() => (
    <root>
      {/* <Navbar /> */}
      <div className="game" id="game-play">
        <div id="menu">
          <button id="play-local" onclick={() => playGame(user.id, undefined, true, false)}>Play Locally</button>
          <button id="play-local-ai" onclick={() => playGame(user.id, undefined, true, true)}>Play vs AI</button>
          <button id="play-remote" style={{ backgroundColor: getColor() }} onclick={() => playRemote()}>{getValue()}</button>
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