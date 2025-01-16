export const INPUT_MOVE_NONE = 0;
export const INPUT_MOVE_UP = 1;
export const INPUT_MOVE_DOWN = 2;

export const GAME_WIDTH = 4 * 5;
export const GAME_HEIGHT = 3 * 4;
export const BALL_RADIUS = 0.3;
export const PADDLE_XRADIUS = 0.2;
export const PADDLE_YRADIUS = 1;
export const PADDLE_XOFFSET = 0.2;
const PADDLE_SPEED = 15;
const BALL_SPEED = 8;

export class Pong {
    p1_y: number;
    p1_x: number;
    p2_y: number;
    p2_x: number;
    ball_x: number;
    ball_y: number;
    ball_vx: number;
    ball_vy: number;

    score1: number;
    score2: number;

    resetBall() {
        this.ball_x = this.ball_y = 0;
        this.ball_vx = Math.random() > 0.5 ? 1 : -1;
        this.ball_vy = (Math.random() - 0.5) * 2;
        const norm = Math.sqrt(this.ball_vx ** 2 + this.ball_vy ** 2);
        this.ball_vx /= norm;
        this.ball_vy /= norm;
    }

    constructor() {
        this.p1_y = 0;
        this.p2_y = 0;
        this.p1_x = -GAME_WIDTH / 2 + PADDLE_XOFFSET + PADDLE_XRADIUS;
        this.p2_x = GAME_WIDTH / 2 - PADDLE_XOFFSET - PADDLE_XRADIUS;
        this.ball_x = this.ball_y = this.ball_vx = this.ball_vy = 0;
        this.resetBall();
        this.score1 = this.score2 = 0;
    }

    update(p1_input: number, p2_input: number, dt: number) {
        // Update paddles
        if (p1_input === INPUT_MOVE_UP) {
            this.p1_y = Math.min(this.p1_y + PADDLE_SPEED * dt, GAME_HEIGHT / 2 - PADDLE_YRADIUS);
        } else if (p1_input === INPUT_MOVE_DOWN) {
            this.p1_y = Math.max(this.p1_y - PADDLE_SPEED * dt, -GAME_HEIGHT / 2 + PADDLE_YRADIUS);
        }

        if (p2_input === INPUT_MOVE_UP) {
            this.p2_y = Math.min(this.p2_y + PADDLE_SPEED * dt, GAME_HEIGHT / 2 - PADDLE_YRADIUS);
        } else if (p2_input === INPUT_MOVE_DOWN) {
            this.p2_y = Math.max(this.p2_y - PADDLE_SPEED * dt, -GAME_HEIGHT / 2 + PADDLE_YRADIUS);
        }

        // Update ball position
        this.ball_x += BALL_SPEED * this.ball_vx * dt;
        this.ball_y += BALL_SPEED * this.ball_vy * dt;

        // Ball collision with top and bottom walls
        if (this.ball_y + BALL_RADIUS > GAME_HEIGHT / 2 || this.ball_y - BALL_RADIUS < -GAME_HEIGHT / 2) {
            this.ball_vy = -this.ball_vy;
        }

        // Ball collision with paddles
        if (
            this.ball_x - BALL_RADIUS < this.p1_x + PADDLE_XRADIUS &&
            this.ball_x + BALL_RADIUS > this.p1_x - PADDLE_XRADIUS &&
            this.ball_y > this.p1_y - PADDLE_YRADIUS &&
            this.ball_y < this.p1_y + PADDLE_YRADIUS
        ) {
            this.ball_vx = Math.abs(this.ball_vx);
        } else if (
            this.ball_x + BALL_RADIUS > this.p2_x - PADDLE_XRADIUS &&
            this.ball_x - BALL_RADIUS < this.p2_x + PADDLE_XRADIUS &&
            this.ball_y > this.p2_y - PADDLE_YRADIUS &&
            this.ball_y < this.p2_y + PADDLE_YRADIUS
        ) {
            this.ball_vx = -Math.abs(this.ball_vx);
        }

        // Check for game over
        if (this.ball_x + BALL_RADIUS > GAME_WIDTH / 2 || this.ball_x - BALL_RADIUS < -GAME_WIDTH / 2) {
            if (this.ball_x < 0)
                this.score2++;
            else
                this.score1++;
            this.resetBall();

        }
    }
}
