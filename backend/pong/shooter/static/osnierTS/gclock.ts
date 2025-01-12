import * as THREE from 'three';

export class gameClock {
	scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    msPrev: number;
    msNow: number;
    excessTime: number;
    msPrevTrue: number;

	fps: number;
	msPerFrame: number;
	msPassed: number;

	frameTimes: number[];
	frame: number;
	full: boolean;
	frameCount: number;
	startTime: number;
	saveTime: number;
	
	constructor(scene, camera, renderer) {
		this.setFps(60);
		this.msPrev = 0;
		this.msNow = new Date().valueOf();
		this.excessTime = 0;
		this.loop = this.loop.bind(this);
		this.msPrevTrue = this.msNow;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
		this.frameTimes = new Array(60) as number[];
		this.frameTimes.fill(0);
		this.frame = 0;
		this.full = false;
		this.frameCount = 0;
		this.startTime = new Date().valueOf();
		this.saveTime = this.startTime;
	}

	setFps(fps) {
		this.fps = fps;
		this.msPerFrame = Math.floor(1000 / fps);
	}

	setFrameTime() {
		if (this.frame === 60) {
			this.full = true;
			this.frame = 0;
		}
		this.frameTimes[this.frame] = this.msPrev;
		this.frame++;
	}

	getFrameTime(reverseIdx) {
		if (reverseIdx > 60) {
			console.log("invalid frame time index");// get rid of this
			return ;
		}
		return this.frameTimes[(this.frame - reverseIdx + 59) % 60];
	}

	setStartTime(startTime) {
		this.msPrev = 0;
		this.excessTime = 0;
		this.frame = 0;
		this.full = false;
		this.frameCount = 0;
		this.startTime = startTime;
	}


	loop(animate, rollBack, handleInputs) {
		window.requestAnimationFrame(() => this.loop(animate, rollBack, handleInputs));
		rollBack(this.startTime);
		this.msNow = new Date().valueOf() - this.startTime;
		this.msPassed = this.msNow - this.msPrev;
		this.msPrevTrue = this.msNow;
		if (this.msPassed < this.msPerFrame)
			return ;

		handleInputs(this.msPassed, this.msPrev);
		
		animate(this.msPassed, this.msPrev);
		this.setFrameTime();
		this.excessTime = 0;
		this.msPrev = this.msNow - this.excessTime;

		this.renderer.render( this.scene, this.camera );
		this.frameCount++;
	}
}