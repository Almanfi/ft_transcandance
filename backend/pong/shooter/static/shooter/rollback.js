export class RollData {
    constructor(position, speed, lastFire, input) {
        this.position = position;
        this.speed = speed;
        this.lastFire = lastFire;
        this.input = input;
    }
    addInput(input) {
        this.input.push(input);
    }
}
export class Rollback {
    // savedData: Map<frameIndex, dataSaved>;
    constructor() {
        this.savedData = new Map();
    }
    saveFrame(frameIndex, position, speed, input, lastFire) {
        let data = new RollData(position, speed, lastFire, [input]);
        this.savedData.set(frameIndex, data);
        return data;
    }
    rollbackFrame(frameIndex) {
        return this.savedData.get(frameIndex);
    }
}
