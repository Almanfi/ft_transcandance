import {
  Pong,
  INPUT_MOVE_UP,
  INPUT_MOVE_DOWN,
  INPUT_MOVE_NONE,
  GAME_WIDTH,
  GAME_HEIGHT,
  BALL_RADIUS,
  PADDLE_XOFFSET,
  PADDLE_XRADIUS,
  PADDLE_YRADIUS,
} from "./pong.js";

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

function renderGame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, game: Pong) {
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

  {
    const bx = screenCenterX + meterToPixel * +game.ball_x;
    const by = screenCenterY + meterToPixel * -game.ball_y;
    ctx.beginPath();
    ctx.arc(bx, by, BALL_RADIUS * meterToPixel, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fill();
    ctx.closePath();
  }
  function renderPaddle(px: number, py: number) {
    const x = screenCenterX + meterToPixel * +px;
    const y = screenCenterY + meterToPixel * -py;

    ctx.beginPath();

    ctx.fillStyle = "rgb(100, 100, 255)";

    const w = 2 * meterToPixel * PADDLE_XRADIUS;
    const h = 2 * meterToPixel * PADDLE_YRADIUS;
    ctx.fillRect(x - w * 0.5, y - h * 0.5, w, h);
    ctx.closePath();
  }
  renderPaddle(game.p1_x, game.p1_y);
  renderPaddle(game.p2_x, game.p2_y);
  {
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.font = `${Math.floor(meterToPixel * 1.2)}px Arial`;

    const scoreY = yOffset + meterToPixel * 0.2;
    const scoreP1X = screenCenterX - meterToPixel * 2;
    const scoreP2X = screenCenterX + meterToPixel * 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillText(game.score1.toString(), scoreP1X, scoreY);
    ctx.fillText(game.score2.toString(), scoreP2X, scoreY);
  }
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
}

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

export function playGame(local: boolean, against_ai: boolean) {
  console.log("play game");

  let socket: WebSocket;
  let game_started: boolean = true;
  let last_game_state: any = undefined;

  if (!local) {
    game_started = false;
    socket = new WebSocket("ws://127.0.0.1:8000/ws/game");
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.message === "game_starting") {
        game_started = true;
        console.log("STARTING GAME!", data);
      } else if (data.message === "game_state") {
        last_game_state = data;
      } else if (data.message == "game_over") {
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

  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.style.display = "block";
  {
    const menu = document.getElementById("menu") as HTMLDivElement;
    menu.style.display = "none";
  }

  if (ctx == null) {
    // TODO:!!
    return;
  }
  let pong = new Pong();
  let last_timestamp: number | undefined = undefined;

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
  }
  let gameInput = new GameInput();

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    if (event.code === "KeyW") gameInput.w = true;
    else if (event.code === "KeyS") gameInput.s = true;
    else if (event.code === "ArrowUp") gameInput.arrow_up = true;
    else if (event.code === "ArrowDown") gameInput.arrow_down = true;
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "KeyW") gameInput.w = false;
    else if (event.code === "KeyS") gameInput.s = false;
    else if (event.code === "ArrowUp") gameInput.arrow_up = false;
    else if (event.code === "ArrowDown") gameInput.arrow_down = false;
  });

  window.addEventListener("visibilitychange", gameInput.clear);
  window.addEventListener("focus", gameInput.clear);
  window.addEventListener("blur", gameInput.clear);

  function tick(timestamp: number) {
    resizeCanvas(canvas);
    window.requestAnimationFrame(tick);

    let dt = 1.0 / 60;
    if (last_timestamp !== undefined) dt = (timestamp - last_timestamp) / 1000;
    if (dt > 1.0 / 10) dt = 1.0 / 10;
    last_timestamp = timestamp;

    let player1_input = INPUT_MOVE_NONE;
    let player2_input = INPUT_MOVE_NONE;

    if (gameInput.w && !gameInput.s) player1_input = INPUT_MOVE_UP;
    else if (gameInput.s && !gameInput.w) player1_input = INPUT_MOVE_DOWN;
    if (gameInput.arrow_up && !gameInput.arrow_down)
      player2_input = INPUT_MOVE_UP;
    else if (gameInput.arrow_down && !gameInput.arrow_up)
      player2_input = INPUT_MOVE_DOWN;

    if (game_started) {
      if (local) {
        if (against_ai) player2_input = getAIMove(pong, 2);
        pong.update(player1_input, player2_input, dt);
      } else {
        if (!document.hasFocus()) {
          console.log("no focus");
          player1_input = getAIMove(pong, 1);
        }
        // TODO: some kinda of interpolation
        if (last_game_state !== undefined) {
          if (
            last_game_state.ball !== undefined &&
            last_game_state.ball.x !== undefined &&
            last_game_state.ball.y !== undefined &&
            last_game_state.ball.vx !== undefined &&
            last_game_state.ball.vy !== undefined
          ) {
            pong.ball_x = last_game_state.ball.x;
            pong.ball_y = last_game_state.ball.y;
            pong.ball_vx = last_game_state.ball.vx;
            pong.ball_vy = last_game_state.ball.vy;
          }

          if (last_game_state.p1 !== undefined) pong.p1_y = last_game_state.p1;
          if (last_game_state.p2 !== undefined) pong.p2_y = last_game_state.p2;
          if (
            last_game_state.score1 !== undefined &&
            last_game_state.score2 !== undefined
          ) {
            pong.score1 = last_game_state.score1;
            pong.score2 = last_game_state.score2;
          }
        }
        socket.send(
          JSON.stringify({
            message: "game_input",
            input: player1_input,
          })
        );
      }
    }

    if (game_started) renderGame(canvas, ctx, pong);
    else {
      let state: string = "CONNECTED!";
      if (socket.readyState === WebSocket.CONNECTING) state = "CONNECTING...";
      else if (socket.readyState === WebSocket.CLOSING) state = "CLOSING...";
      else if (socket.readyState === WebSocket.CLOSED) state = "CLOSED";
      ctx.fillStyle = "rgb(80, 80, 80)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "30px Arial"; // Set the font and size
      ctx.fillStyle = "blue"; // Set the fill color
      ctx.textAlign = "center"; // Center the text horizontally
      ctx.textBaseline = "middle"; // Center the text vertically

      // Render text on the canvas
      ctx.fillText(state, 100, 100);
    }
  }
  window.requestAnimationFrame(tick);
}
