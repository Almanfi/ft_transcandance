// @ts-ignore
// @ts-nocheck
export class gameClock {
    scene;
    camera;
    renderer;
    msPrev;
    msNow;
    excessTime;
    msPrevTrue;
    fps;
    msPerFrame;
    msPassed;
    frameTimes;
    frame;
    full;
    frameCount;
    startTime;
    saveTime;
    lastRanderTime;
    runing = false;
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
        this.frameTimes = new Array(60);
        this.frameTimes.fill(0);
        this.frame = 0;
        this.full = false;
        this.frameCount = 0;
        this.startTime = new Date().valueOf();
        this.saveTime = this.startTime;
        this.lastRanderTime = 0;
    }
    start() {
        this.runing = true;
    }
    stop() {
        this.runing = false;
    }
    setFps(fps) {
        this.fps = fps;
        this.msPerFrame = Math.floor(1000 / fps);
    }
    getFrameTime(index) {
        index = (index + 60) % 60;
        return this.frameTimes[index];
    }
    // sameFrame(start: number, final: number): boolean {
    // 	if (start > final)
    // 		final += 60;
    // 	if (final - start > 60)
    // }
    getFrameIndex(currentTime) {
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
    getFrameTimeRevrese(reverseIdx) {
        if (reverseIdx > 60) {
            console.log("invalid frame time index"); // get rid of this
            return;
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
    getLastRanderTime() {
        return this.lastRanderTime;
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    loop(animate, rollBack) {
        window.requestAnimationFrame(() => this.loop(animate, rollBack));
        if (this.runing === false)
            return;
        this.msNow = new Date().valueOf() - this.startTime;
        this.msPassed = this.msNow - this.msPrev;
        this.msPrevTrue = this.msNow;
        if (this.msPassed < this.msPerFrame) {
            // rollBack(this.startTime, "fast");
            return;
        }
        this.setFrameTime();
        this.lastRanderTime = this.msPrev + this.msPerFrame;
        rollBack(this.startTime, "slow");
        animate(this.msPassed, this.msPrev);
        this.excessTime = 0;
        this.msPrev = this.msNow - this.excessTime;
        this.renderer.render(this.scene, this.camera);
        this.frameCount++;
    }
}