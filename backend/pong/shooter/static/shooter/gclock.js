export class gameClock {
	constructor(scene, camera, renderer) {
		this.fps = 60;
		this.msPerFrame = 1000 / this.fps;
		this.msPrev = window.performance.now();
		this.msNow = window.performance.now();
		this.excessTime = 0;
		this.loop = this.loop.bind(this);
		this.msPrevTrue = this.msNow;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
		this.frameTimes = new Array(60).fill(0);
		this.frame = 0;
		this.full = false;
		this.frameCount = 0;
		this.startTime = window.performance.now();
	}

	setFps(fps) {
		this.fps = fps;
		this.msPerFrame = 1000 / fps;
	}

	setFrameTime() {
		if (this.frame === 60) {
			this.full = true;
			this.frame = 0;
		}
		this.frameTimes[this.frame] = this.msPrev - this.startTime;
		this.frame++;
	}

	getFrameTime(reverseIdx) {
		if (reverseIdx > 60) {
			console.log("invalid frame time index");// get rid of this
			return ;
		}
		// if (this.full === false)
		// 	return this.frameTimes[this.frame - reverseIdx - 1];
		return this.frameTimes[(this.frame - reverseIdx + 59) % 60];
		let frame = this.frame - reverseIdx - 1;
		if (frame < 0)
			frame += 60;
		return this.frameTimes[frame];

	}

	loop(animate, rollBack) {
		window.requestAnimationFrame(() => this.loop(animate, rollBack));
		this.msNow = window.performance.now();
		this.msPassed = this.msNow - this.msPrev;
		// animate((this.msNow - this.msPrevTrue) / 1000);
		this.msPrevTrue = this.msNow;
		// rollBack(this.startTime);
		if (this.msPassed < this.msPerFrame)
			return ;
		frames++
		
		this.excessTime = this.msPassed % this.msPerFrame;
		this.msPrev = this.msNow - this.excessTime;
		animate((this.msPassed) / 1000, this.msPrev, this.frameCount, this.startTime);
		this.setFrameTime();
	
		// controls.update();
		// if (player.currAnimation.nextSprite >= 0)
		// 	console.log(player.currAnimation.hitBox[player.currAnimation.nextSprite][0].mesh.visible);
		this.renderer.render( this.scene, this.camera );
		this.frameCount++;
	}
}