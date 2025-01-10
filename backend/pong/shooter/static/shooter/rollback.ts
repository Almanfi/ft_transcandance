import * as THREE from 'three';

export type dataSaved = {
    // frameIndex: number;
    position: THREE.Vector3;
    speed: THREE.Vector3;
    lastFire: number;
    input: string;
}

type frameIndex = number;

export class Rollback {

    savedData: Map<frameIndex, dataSaved>;

    constructor() {
        this.savedData = new Map();
    }

    saveFrame(frameIndex: frameIndex, position: THREE.Vector3,
        speed: THREE.Vector3, input: string, lastFire: number) {
        this.savedData.set(frameIndex, {position, speed, input, lastFire});
    }

    rollbackFrame(frameIndex: frameIndex) {
        return this.savedData.get(frameIndex);
    }

}