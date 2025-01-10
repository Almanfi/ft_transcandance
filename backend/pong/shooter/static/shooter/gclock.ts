import * as THREE from 'three';

export class gameClock {
	scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;

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
	
	constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
		this.setFps(60);
		this.msPrev = 0;
		this.msNow = performance.now();
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
		this.startTime = performance.now();
		this.saveTime = this.startTime;
	}

	setFps(fps: number) {
		this.fps = fps;
		this.msPerFrame = Math.floor(1000 / fps);
	}

	getFrameTime(index: number): number {
		return this.frameTimes[index];
	}

	getFrameIndex(currentTime: number): number {
		let index = (this.frame - 1 + 60) % 60;
		if (this.frameTimes[index] === currentTime) {
			// console.log("frame time is the same as current time");
			return index;
		}
		let maxIterate = 60;
		while (this.frameTimes[index] > currentTime && --maxIterate) {
			index = (index - 1 + 60) % 60;
			// console.log('frame time: ', this.frameTimes[index]);
			// if (--maxIterate)
			// 	return -1;
		}
		if (maxIterate === 0)
			return -1;
		return index;
	}

	setFrameTime() {
		if (this.frame === 60) {
			this.full = true;
			this.frame = 0;
		}
		this.frameTimes[this.frame] = this.msPrev;
		this.frame++;
	}

	getFrameTimeRevrese(reverseIdx: number) {
		if (reverseIdx > 60) {
			console.log("invalid frame time index");// get rid of this
			return ;
		}
		return this.frameTimes[(this.frame - reverseIdx + 59) % 60];
	}

	setStartTime(startTime: number) {
		this.msPrev = 0;
		this.excessTime = 0;
		this.frame = 0;
		this.full = false;
		this.frameCount = 0;
		this.startTime = startTime;
	}


	loop(animate: (passed: number, prev: number) => void,
		rollBack: (start: number) => void) {
		window.requestAnimationFrame(() => this.loop(animate, rollBack));
		rollBack(this.startTime);
		this.msNow = performance.now() - this.startTime;
		this.msPassed = this.msNow - this.msPrev;
		this.msPrevTrue = this.msNow;
		if (this.msPassed < this.msPerFrame)
			return ;

		this.setFrameTime();
		// handleInputs(this.msPassed, this.msPrev);
		
		animate(this.msPassed, this.msPrev);
		this.excessTime = 0;
		this.msPrev = this.msNow - this.excessTime;

		this.renderer.render( this.scene, this.camera );
		this.frameCount++;
	}
}