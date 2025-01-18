// @ts-ignore
// @ts-nocheck
export class RollData {
    position;
    speed;
    lastFire;
    input;
    health;
    constructor(position, speed, lastFire, health, input) {
        this.position = position;
        this.speed = speed;
        this.lastFire = lastFire;
        this.health = health;
        this.input = input;
    }
    addInput(input) {
        this.input.push(input);
    }
}
export class Rollback {
    savedData;
    // savedData: Map<frameIndex, dataSaved>;
    constructor() {
        this.savedData = new Map();
    }
    saveFrame(frameIndex, position, speed, input, lastFire, health) {
        let data = new RollData(position, speed, lastFire, health, [input]);
        this.savedData.set(frameIndex, data);
        return data;
    }
    rollbackFrame(frameIndex) {
        return this.savedData.get(frameIndex);
    }
}
