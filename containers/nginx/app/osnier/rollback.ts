import * as THREE from 'three';

export type dataSaved = {
    // frameIndex: number;
    position: THREE.Vector3;
    speed: THREE.Vector3;
    lastFire: number;
    input: string[];
    health: number;
}

export class RollData {
    position: THREE.Vector3;
    speed: THREE.Vector3;
    lastFire: number;
    input: string[];
    health: number;

    constructor(position: THREE.Vector3, speed: THREE.Vector3,
                lastFire: number, health: number, input: string[]) {
        this.position = position;
        this.speed = speed;
        this.lastFire = lastFire;
        this.health = health;
        this.input = input;
    }

    addInput(input: string) {
        this.input.push(input);
    }
}

type frameIndex = number;

export class Rollback {

    savedData: Map<frameIndex, RollData>;
    // savedData: Map<frameIndex, dataSaved>;

    constructor() {
        this.savedData = new Map();
    }

    saveFrame(frameIndex: frameIndex, position: THREE.Vector3,
        speed: THREE.Vector3, input: string, lastFire: number, health: number) {
        let data = new RollData(position, speed, lastFire, health, [input]);
        this.savedData.set(frameIndex, data);
        return data;
    }


    rollbackFrame(frameIndex: frameIndex) {
        return this.savedData.get(frameIndex);
    }

}