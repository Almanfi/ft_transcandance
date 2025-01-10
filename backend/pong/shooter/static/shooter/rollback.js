export class Rollback {
    constructor() {
        this.savedData = new Map();
    }
    saveFrame(frameIndex, position, speed, input, lastFire) {
        this.savedData.set(frameIndex, { position, speed, input, lastFire });
    }
    rollbackFrame(frameIndex) {
        return this.savedData.get(frameIndex);
    }
}
