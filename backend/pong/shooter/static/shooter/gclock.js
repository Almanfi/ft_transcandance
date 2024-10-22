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
	}

	setFps(fps) {
		this.fps = fps;
		this.msPerFrame = 1000 / fps;
	}

	loop(animate) {
		window.requestAnimationFrame(() => this.loop(animate))
		this.msNow = window.performance.now();
		this.msPassed = this.msNow - this.msPrev;
		animate(this.msNow - this.msPrevTrue);
		this.msPrevTrue = this.msNow;
		if (this.msPassed < this.msPerFrame)
			return ;
		frames++

		this.excessTime = this.msPassed % this.msPerFrame;
		this.msPrev = this.msNow - this.excessTime;
	
		// controls.update();
		// if (player.currAnimation.nextSprite >= 0)
		// 	console.log(player.currAnimation.hitBox[player.currAnimation.nextSprite][0].mesh.visible);
		this.renderer.render( this.scene, this.camera );
	}
}