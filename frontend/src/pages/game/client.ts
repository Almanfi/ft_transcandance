import {
  Pong, INPUT_MOVE_UP, INPUT_MOVE_DOWN, INPUT_MOVE_NONE,
  GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, PADDLE_XOFFSET, PADDLE_XRADIUS, PADDLE_YRADIUS
} from './pong.js';

import api from '../../services/api.js';

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
    console.log(`resizing canvas ${canvas.width} ${canvas.height} (devicePixelRatio = ${dpr}),
                    window innerDim: ${window.innerWidth} ${window.innerHeight},
                    boundingClientRect: ${width} ${height},
                    clientDim: ${canvas.clientWidth} ${canvas.clientHeight}`);
  }
}

let game_ping = -1;



function getAIMove(pong: Pong, player: number) {
  let x = pong.p1_x;
  let y = pong.p1_y;
  if (player == 2) (x = pong.p2_x), (y = pong.p2_y);

  let input = INPUT_MOVE_NONE;
  if ((pong.ball_vx < 0 && x < 0) || (pong.ball_vx > 0 && x > 0)) {
    if (pong.ball_y >= y - PADDLE_YRADIUS && pong.ball_y <= y + PADDLE_YRADIUS)
      input = INPUT_MOVE_NONE;
    else if (y < pong.ball_y) input = INPUT_MOVE_UP;
    else input = INPUT_MOVE_DOWN;
  }
  return input;
}



export async function playGame(my_id: string, game_data: any, local: boolean, against_ai: boolean) {
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

  let ai_pong_state: Pong = new Pong();
  let ai_pong_state_time = Date.now();
  let me: any = undefined;
  let opp: any = undefined;
  
  function connectToServer() {
    console.log(`game data: ${game_data}`)
    game_data = JSON.parse(game_data);
    
    let my_team = "A";
    if (my_id === game_data.team_a[0].id)
      my_team = "A";
    else if (my_id === game_data.team_b[0].id)
      my_team = "B";
    else
      console.error("BAD!1");

    if (my_team === "A") {
      me = game_data.team_a[0];
      opp = game_data.team_b[0];
    }
    else {
      me = game_data.team_b[0];
      opp = game_data.team_a[0];
    }
    console.log("ME: ", me);

    game_started = false;

    socket = new WebSocket(`${api.websocketApi}/ws/game_pong/${game_data.id}/`);
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.message === "game_starting") {
        game_started = true;

        console.log("STARTING GAME!", data);
      } else if (data.message === "game_state") {
        last_game_state = data;
      } else if (data.message == "game_over") {
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
        console.log("GAME ENDED!")
      }
      
    };

    socket.onopen = (e) => {
      console.log("CONNECTED");
      socket.send(JSON.stringify({ message: "hello!" }));
    };

    socket.onclose = (e) => {
      console.log("DISCONNECTED ", e);
    };
  }

  if (!local)
    connectToServer();

  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.style.display = 'block';
  {
    const menu = document.getElementById("menu") as HTMLDivElement;
    menu.style.display = 'none';
  }

  if (ctx == null) {
    // TODO:!!
    return;
  }
  let pong = new Pong();
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
  
    renderPaddle(pong.p1_x, pong.p1_y);
    renderPaddle(pong.p2_x, pong.p2_y);
  
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
        ctx.fillText(me.username,  my_x, y);
        ctx.fillText(opp.username, opp_x, y);
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
    if (game_started && socket !== undefined && socket.readyState != WebSocket.OPEN) {
      canvas.style.display = 'none';
      {
        const menu = document.getElementById("menu") as HTMLDivElement;
        menu.style.display = 'block';
      }
      return ;
    }
    window.requestAnimationFrame(tick);

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
    if (game_started) {
      if (Date.now() - ai_pong_state_time > 1000) {
        ai_pong_state = pong;
        ai_pong_state_time = Date.now();
      }
      if (local) {
        if (against_ai)
          player2_input = getAIMove(pong, 2);
        pong.update(player1_input, player2_input, dt);
      }
      else {


        if (!document.hasFocus()) {
          player1_input = getAIMove(pong, 1);
        }
        if (last_game_state !== undefined) {
          // TODO: some kinda of interpolation here instead of just snapping to place!
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

          let time_now = Date.now() / 1000;

          let time_passed = time_now - last_game_state.time;
          if (time_passed < 0)
            time_passed = 0;
          if (game_ping !== -1 && time_passed > game_ping * 3)
            time_passed = 0;

          // N^2 but I don't care
          while (inputs_sent.length > 0 && inputs_sent[0].time < last_game_state.time)
            inputs_sent.splice(0, 1);
          // if (time_passed) {
          //     //console.log("FIXING ", time_passed, inputs_sent.length);
          //     if (inputs_sent.length) {
          //         // TODO: cap length
          //         pong.update(inputs_sent[0].input, INPUT_MOVE_NONE, inputs_sent[0].time - last_game_state.time);
          //         for (let i = 1; i < inputs_sent.length; i++)
          //             pong.update(inputs_sent[i - 1].input, INPUT_MOVE_NONE, inputs_sent[i].time - inputs_sent[i - 1].time);
          //         pong.update(inputs_sent[inputs_sent.length - 1].input, INPUT_MOVE_NONE, 

          //             time_now - inputs_sent[inputs_sent.length - 1].time);
          //     }
          //     else
          //         pong.update(INPUT_MOVE_NONE, INPUT_MOVE_NONE, time_passed);
          // }
        }
        inputs_sent.push({ input: player1_input, time: Date.now() / 1000 });
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
      let state: string = "CONNECTED!";
      if (socket.readyState === WebSocket.CONNECTING)
        state = "CONNECTING...";
      else if (socket.readyState === WebSocket.CLOSING)
        state = "CLOSING...";
      else if (socket.readyState === WebSocket.CLOSED)
        state = "CLOSED";
      ctx.fillStyle = "rgb(80, 80, 80)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '30px Arial';  // Set the font and size
      ctx.fillStyle = 'blue';   // Set the fill color
      ctx.textAlign = 'center'; // Center the text horizontally
      ctx.textBaseline = 'middle'; // Center the text vertically

      // Render text on the canvas
      ctx.fillText(state, 100, 100);
      ctx.fillText("Ping: " + game_ping.toString(), 100, 400);
    }
  }
  window.requestAnimationFrame(tick);
}