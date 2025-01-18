// @ts-ignore
import Ura from 'ura';

import {
  Pong, INPUT_MOVE_UP, INPUT_MOVE_DOWN, INPUT_MOVE_NONE,
  GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, PADDLE_XOFFSET, PADDLE_XRADIUS, PADDLE_YRADIUS
} from './pong.js';

import api from '../../../services/api.js';

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  //const displayWidth  = Math.round(width * dpr);
  //const displayHeight = Math.round(height * dpr);
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  if (canvas.width != displayWidth || canvas.height != displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    // console.log(`resizing canvas ${canvas.width} ${canvas.height} (devicePixelRatio = ${dpr}),
    //                 window innerDim: ${window.innerWidth} ${window.innerHeight},
    //                 boundingClientRect: ${width} ${height},
    //                 clientDim: ${canvas.clientWidth} ${canvas.clientHeight}`);
  }
}

let game_ping = -1;

// store last second input and maybe say something like
// changing direction can only happen every let's say 200ms

let last_ai_input_time: number;
let last_ai_input: number;
let ai_base = 0;

function deepCopyGame(pong: Pong) {
  let game = new Pong();
  game.ball_x = pong.ball_x;
  game.ball_y = pong.ball_y;
  game.ball_vx = pong.ball_vx;
  game.ball_vy = pong.ball_vy;

  game.p1_x = pong.p1_x;
  game.p2_x = pong.p2_x;
  game.p1_y = pong.p1_y;
  game.p2_y = pong.p2_y;

  game.score1 = pong.score1;
  game.score2 = pong.score2;
  return game;
}

function getAIMove(pong: Pong, ai_pong: Pong, player: number) {
  let target_y = ai_base;
  if (ai_pong.ball_vx > 0)
  {
    let curr_x = pong.ball_x;
    let curr_y = pong.ball_y;
    let curr_vx = pong.ball_vx;
    let curr_vy = pong.ball_vy;
    for (let itr = 0; itr < 16; itr++) {
      let collision = -1;
      let t = 100000;
      

      // up
      if (curr_vy > 0) {
        // curr_y + t * curr_vy = GAME_HEIGHT/2
        let T = (GAME_HEIGHT / 2 - curr_y) / curr_vy;
        if (T >= 0 && T < t) {
          t = T;
          collision = 0;
        }
      }
      // down
      if (curr_vy < 0) {
        let T = (-GAME_HEIGHT/2 - curr_y) / curr_vy;
        if (T >= 0 && T < t) {
          t = T;
          collision = 1;
        }
      }
      // left
      if (curr_vx < 0) {
        let T = (ai_pong.p1_x + PADDLE_XRADIUS - curr_x) / curr_vx;
        if (T >= 0 && T < t) {
          t = T;
          collision = 2;
        }
      }
      // right
      if (curr_vx > 0) {
        // curr_x + t * curr_vx = GAME_WIDTH / 2
        let T = (GAME_WIDTH/2 - curr_x) / curr_vx;
        if (T >= 0 && T < t) {
          target_y = curr_y + curr_vy * T;
          break ;
        }
      }

      if (collision != -1) {
        curr_x += curr_vx * t;
        curr_y += curr_vy * t;
        if (collision == 2)
          curr_vx *= -1;
        else
          curr_vy *= -1;
      }
    }
  }

  let y = pong.p2_y;
  

  let input = INPUT_MOVE_NONE;
  if (y < target_y - 0.2 * PADDLE_YRADIUS)
      input = INPUT_MOVE_UP;
  else if (y > target_y + 0.2 * PADDLE_YRADIUS)
      input = INPUT_MOVE_DOWN;
  
  if (Date.now() - last_ai_input_time < 10) {
    //if (input == INPUT_MOVE_NONE)
    //  last_ai_input = input;
    return last_ai_input;
  }
  else
    last_ai_input_time = Date.now();

  last_ai_input = input;

  return input;
}

export let game_over: boolean = true;
export let game_cancel: boolean = false;

export function playGame(my_id: string, game_data: any, local: boolean, against_ai: boolean) {
  
  last_ai_input_time = Date.now();
  last_ai_input = INPUT_MOVE_NONE;

  game_over = false;
  game_cancel = false;

  let socket: WebSocket;
  let game_started: boolean = true;
  let last_game_state: any = undefined;

  interface Ping {
    id: number,
    time: number
  };

  interface InputSent {
    input: number,
    time: number,
  };

  let pings: Array<Ping> = [];
  let inputs_sent: Array<InputSent> = [];

  let last_ping_time: number | undefined = undefined;
  let next_ping_id = 0;


  let me: any = undefined;
  let opp: any = undefined;
  let pong_connection_time:any = undefined;
  let game_ending = false;
  let game_ending_time:any = undefined;

  function connectToServer() {
    //console.log(`game data: ${game_data}`)
    game_data = JSON.parse(game_data);
    
    let my_team = "A";
    if (my_id === game_data.team_a[0].id)
      my_team = "A";
    else if (my_id === game_data.team_b[0].id)
      my_team = "B";
    //else
    //  console.error("BAD!1");

    if (my_team === "A") {
      me = game_data.team_a[0];
      opp = game_data.team_b[0];
    }
    else {
      me = game_data.team_b[0];
      opp = game_data.team_a[0];
    }
    // console.log("ME: ", me);

    game_started = false;

    socket = new WebSocket(`${api.websocketApi}/ws/game_pong/${game_data.id}/`);
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message === "game_starting") {
        console.log("[PONG SOCKET] GAME STARTING");
        game_started = true;
        showGame();

      } else if (data.message === "game_state") {
        if (!game_ending)
          last_game_state = data;
      }
      else if (data.message == "game_pong") {
        if (data.id !== undefined) {

          pings.forEach((ping, index) => {
            if (ping.id === data.id) {
              game_ping = Date.now() - ping.time;
              pings.splice(index, 1);
            }
          });
        }
      }
      else if (data.message == "game_end") {
        console.log("[PONG SOCKET] GAME ENDED");
        game_ending = true;
        game_ending_time = Date.now();
        pong.score1 = last_game_state.score1 = data.my_score;
        pong.score2 = last_game_state.score2 = data.opp_score;
      }
      
    };

    socket.onopen = (e) => {
      console.log("[PONG SOCKET] CONNECTED");
      pong_connection_time = Date.now();
    };

    socket.onclose = (e) => {
      if (game_started && !game_ending) {
        game_ending = true;
        game_ending_time = Date.now();
        if (pong.ball_x < 0)
            pong.score2++;
        else
          pong.score1++;
      }
      console.log("[PONG SOCKET] DISCONNECTED ", e);
    };
  }

  if (!local)
    connectToServer();

  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  

  if (ctx == null) {
    return true;
  }

  function showGame() {
    canvas.style.display = 'block';

  }
  if (local)
      showGame();

  let pong = new Pong();
  let ai_pong_state = deepCopyGame(pong);
  let ai_pong_state_time = Date.now();
  let last_timestamp: number | undefined = undefined;

  const default_image_path = "/";
  let my_image = new Image();

  let opp_image = new Image();
  
  // {
  //   let me_img = new Image();
  //   me_img.src = `/static/rest/images/users_profiles/${me.profile_picture}`;
  //   me_img.onload = (e) => {
  //     my_image = me_img;
  //     console.log("LOADED MY IMAGE!!");
  //   };
  //   let opp_img = new Image();
  //   opp_img.src = `/static/rest/images/users_profiles/${opp.profile_picture}`;
  //   opp_img.onload = (e) => {
  //     opp_image = opp_img;
  //   };
  // }
 

  function renderGame() {
 
    const windowWidth = ctx.canvas.width;
    const windowHeight = ctx.canvas.height;
  
    if (windowWidth === 0 || windowHeight === 0) return;
    const meterToPixel = Math.max(1, Math.floor(Math.min(windowWidth / GAME_WIDTH, windowHeight / GAME_HEIGHT)));
    const xOffset = (windowWidth - meterToPixel * GAME_WIDTH) / 2;
    const yOffset = (windowHeight - meterToPixel * GAME_HEIGHT) / 2;
  
    const targetWidth = windowWidth - 2 * xOffset;
    const targetHeight = windowHeight - 2 * yOffset;
  
    const screenCenterX = xOffset + targetWidth / 2;
    const screenCenterY = yOffset + targetHeight / 2;
  
    ctx.fillStyle = "rgb(15, 15, 15)";
    ctx.fillRect(0, 0, windowWidth, windowHeight);
  
    ctx.fillStyle = "rgb(30, 30, 30)";
    ctx.fillRect(xOffset, yOffset, targetWidth, targetHeight);
  
    // Render Ball
    if (!game_ending)
    {
      const bx = screenCenterX + meterToPixel * (+pong.ball_x);
      const by = screenCenterY + meterToPixel * (-pong.ball_y);
      ctx.beginPath();
      ctx.arc(bx, by, BALL_RADIUS * meterToPixel, 0, 2 * Math.PI, false);
      ctx.fillStyle = "rgb(200, 200, 200)";
      ctx.fill();
      ctx.closePath();
    }
  
    // Function to render paddles
    function renderPaddle(px: number, py: number) {
      const x = screenCenterX + meterToPixel * (+px);
      const y = screenCenterY + meterToPixel * (-py);
  
      ctx.beginPath();
      ctx.fillStyle = "rgb(100, 100, 255)";
      const w = 2 * meterToPixel * PADDLE_XRADIUS;
      const h = 2 * meterToPixel * PADDLE_YRADIUS;
      ctx.fillRect(x - w * 0.5, y - h * 0.5, w, h);
      ctx.closePath();
    }
    
    if (!game_ending) {
      renderPaddle(pong.p1_x, pong.p1_y);
      renderPaddle(pong.p2_x, pong.p2_y);
    }
    // Render Scores
    {
      ctx.fillStyle = "rgb(200, 200, 200)";
      ctx.font = `${Math.floor(meterToPixel * 1.2)}px Arial`;
  
      const scoreY = yOffset + meterToPixel * 0.2;
      const scoreP1X = screenCenterX - meterToPixel * 2;
      const scoreP2X = screenCenterX + meterToPixel * 2;
  
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
  
      ctx.fillText(pong.score1.toString(), scoreP1X, scoreY);
      ctx.fillText(pong.score2.toString(), scoreP2X, scoreY);
    }
  
    // Render Ping Information
    // {
    //   ctx.fillStyle = "rgb(200, 200, 200)";
    //   ctx.font = `${Math.floor(meterToPixel * 1.0)}px Arial`;
  
    //   const x = screenCenterX - GAME_WIDTH / 2 * meterToPixel;
    //   const y = yOffset;
    //   ctx.textAlign = "left";
    //   ctx.textBaseline = "top";
    //   ctx.fillText("ping: " + game_ping.toString(), x, y);
    // }
  
    // Render Vertical Center Line
    if (!game_ending)
    {
      ctx.strokeStyle = "rgb(200, 200, 200)";
      ctx.lineWidth = meterToPixel * 0.1;
      ctx.setLineDash([meterToPixel * 0.5, meterToPixel * 0.5]);
  
      ctx.beginPath();
      ctx.moveTo(screenCenterX, yOffset);
      ctx.lineTo(screenCenterX, windowHeight - yOffset);
      ctx.stroke();
      ctx.closePath();
  
      ctx.setLineDash([]);
    }
  
    if (!local) {
      // Draw username
      {
        const my_x = screenCenterX - meterToPixel * 7;
        const opp_x = screenCenterX + meterToPixel * 7;
        const y = yOffset + meterToPixel * 0.5;

        ctx.fillStyle = "rgb(200, 200, 200)";
        ctx.font = `${Math.floor(meterToPixel * 0.8)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(me.display_name,  my_x, y);
        ctx.fillText(opp.display_name, opp_x, y);
      }
      //Draw images
      {
        const width = GAME_WIDTH * 0.1 * meterToPixel;
        const height = GAME_HEIGHT * 0.2 * meterToPixel;
        const y = yOffset + height * 1.5;
        
        const my_x  = screenCenterX - meterToPixel * 4;
        const opp_x = screenCenterX + meterToPixel * 4;
        ctx.drawImage(my_image, my_x, y, width, height);
        ctx.drawImage(opp_image, opp_x, y, width, height);
      }

      if (game_ending) {
        const x = screenCenterX;
        const y = screenCenterY;
        ctx.fillStyle = "rgb(200, 200, 200)";
        ctx.font = `${Math.floor(meterToPixel * 1.5)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Game Over", x, y);
        ctx.font = `${Math.floor(meterToPixel * 1.2)}px Arial`;
        let username = me.display_name;
        if (pong.score1 < pong.score2)
            username = opp.display_name;
        let s = "";
        if (game_data.tournament_phase == "finals")
            s = " Tournament";

        ctx.fillText(`${username} Won${s}!`, x, y + meterToPixel*1.5);
      }

    }
  }
  

  


  class GameInput {
    w: boolean;
    s: boolean;
    arrow_up: boolean;
    arrow_down: boolean;
    constructor() {
      this.w = this.s = this.arrow_up = this.arrow_down = false;
    }
    clear() {
      this.w = this.s = this.arrow_up = this.arrow_down = false;
    }
  };
  let gameInput = new GameInput();

  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    if (event.code === "KeyW")
      gameInput.w = true;
    else if (event.code === "KeyS")
      gameInput.s = true;
    else if (event.code === "ArrowUp")
      gameInput.arrow_up = true;
    else if (event.code === "ArrowDown")
      gameInput.arrow_down = true;
  });

  window.addEventListener('keyup', (event) => {
    if (event.code === "KeyW")
      gameInput.w = false;
    else if (event.code === "KeyS")
      gameInput.s = false;
    else if (event.code === "ArrowUp")
      gameInput.arrow_up = false;
    else if (event.code === "ArrowDown")
      gameInput.arrow_down = false;
  });

  window.addEventListener('visibilitychange', gameInput.clear);
  window.addEventListener('focus', gameInput.clear);
  window.addEventListener('blur', gameInput.clear);

  let game_time = 0;

  function tick(timestamp: number) {
    resizeCanvas(canvas);
    // console.log("TICKING ", game_ending_time);
    if (socket !== undefined && game_started && socket.readyState == WebSocket.CLOSED)
        game_ending = true
    if (!local) {
      if ((pong_connection_time !== undefined && !game_started && Date.now() - pong_connection_time > 1500)
        || (!game_started && socket !== undefined && socket.readyState == WebSocket.CLOSED)
        || (game_ending && Date.now() - game_ending_time > 3000)
        ) {
        if (socket !== undefined) {
            socket.close();
            socket = undefined;
        }
        canvas.style.display = 'none';

        game_over = true;
        if (!game_started)
          game_cancel = true;
        console.log("EXITING!");
        if (game_data.type === "tournament" && game_data.tournament_phase === "semis" && pong.score1 > pong.score2) {
          Ura.navigate(`/game?name=pong&tournament_id=${game_data.tournament.id}`);
        }
        else
          Ura.navigate("/game?name=pong");
        return ;
      }
    }

    let dt = 1.0 / 60;
    if (last_timestamp !== undefined)
      dt = (timestamp - last_timestamp) / 1000;
    if (dt > 1.0 / 10)
      dt = 1.0 / 10;
    last_timestamp = timestamp;

    let player1_input = INPUT_MOVE_NONE;
    let player2_input = INPUT_MOVE_NONE;

    if (gameInput.w && !gameInput.s) player1_input = INPUT_MOVE_UP;
    else if (gameInput.s && !gameInput.w) player1_input = INPUT_MOVE_DOWN;
    if (gameInput.arrow_up && !gameInput.arrow_down) player2_input = INPUT_MOVE_UP;
    else if (gameInput.arrow_down && !gameInput.arrow_up) player2_input = INPUT_MOVE_DOWN;
    
    if (!local && socket.readyState === WebSocket.OPEN
      && (last_ping_time === undefined || Date.now() - last_ping_time > 1000)
    ) {
      while (pings.length > 2)
        pings.splice(0, 1);
      last_ping_time = Date.now();
      let ping: Ping = { id: next_ping_id, time: last_ping_time };
      pings.push(ping);
      next_ping_id++;
      socket.send(JSON.stringify({ 'message': "game_ping", 'id': ping.id }));
    }
    if (game_started && !game_ending) {
      if (Date.now() - ai_pong_state_time > 1000) {
        ai_pong_state = pong;
        ai_pong_state_time = Date.now();
      }
      if (local) {
        if (against_ai)
          player2_input = getAIMove(pong, ai_pong_state, 2);
        pong.update(player1_input, player2_input, dt);
      }
      else {


        if (!document.hasFocus()) {
          //player1_input = getAIMove(pong, ai_pong_state, 1);
        }
        if (last_game_state !== undefined) {
          if (last_game_state.ball !== undefined &&
            last_game_state.ball.x !== undefined
            && last_game_state.ball.y !== undefined
            && last_game_state.ball.vx !== undefined
            && last_game_state.ball.vy !== undefined) {
            pong.ball_x = last_game_state.ball.x;
            pong.ball_y = last_game_state.ball.y;
            pong.ball_vx = last_game_state.ball.vx;
            pong.ball_vy = last_game_state.ball.vy;
          }

          if (last_game_state.p1 !== undefined)
            pong.p1_y = last_game_state.p1;
          if (last_game_state.p2 !== undefined)
            pong.p2_y = last_game_state.p2;
          if (last_game_state.score1 !== undefined &&
            last_game_state.score2 !== undefined) {
            pong.score1 = last_game_state.score1;
            pong.score2 = last_game_state.score2;
          }

          if (last_game_state.time === undefined)
            last_game_state.time = Date.now() / 1000;

        }
        if (socket.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({
            'message': "game_input",
            'input': player1_input
          }));

      }

      game_time += dt;
    }
    if (game_started)
      renderGame();
    else {
      // let state: string = "CONNECTED!";
      // if (socket.readyState === WebSocket.CONNECTING)
      //   state = "CONNECTING...";
      // else if (socket.readyState === WebSocket.CLOSING)
      //   state = "CLOSING...";
      // else if (socket.readyState === WebSocket.CLOSED)
      //   state = "CLOSED";
      // ctx.fillStyle = "rgb(80, 80, 80)";
      // ctx.fillRect(0, 0, canvas.width, canvas.height);
      // ctx.font = '30px Arial';  // Set the font and size
      // ctx.fillStyle = 'blue';   // Set the fill color
      // ctx.textAlign = 'center'; // Center the text horizontally
      // ctx.textBaseline = 'middle'; // Center the text vertically

      // // Render text on the canvas
      // ctx.fillText(state, 100, 100);
      // ctx.fillText("Ping: " + game_ping.toString(), 100, 400);
    }
    window.requestAnimationFrame(tick);

  }
  window.requestAnimationFrame(tick);

}