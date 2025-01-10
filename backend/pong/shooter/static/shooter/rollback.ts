import * as THREE from 'three';

type dataSaved = {
    // frameIndex: number;
    position: THREE.Vector3;
    speed: THREE.Vector3;
    input: string;
}

type frameIndex = number;

export class Rollback {

    savedData: Map<frameIndex, dataSaved>;

    constructor() {
        this.savedData = new Map();
    }

    saveFrame(frameIndex: frameIndex, position: THREE.Vector3,
        speed: THREE.Vector3, input: string) {
        this.savedData.set(frameIndex, {position, speed, input});
    }

    rollbackFrame(frameIndex: frameIndex) {
        return this.savedData.get(frameIndex);
    }

}