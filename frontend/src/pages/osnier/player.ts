// @ts-ignore
// @ts-nocheck

import * as THREE from './three/three.module.js';
import { Move, GameAction } from './keyControls.js';
import { PlayersBulletManager, Plane } from './assets.js';
import { Rollback, dataSaved, RollData } from './rollback.js';
import { UIRanderer } from './UIRanderer.js';


export class Inputs {
    move: Move;
    angle: number;
    direction: THREE.Vector3;
    action: GameAction;
    timeStamp: number;
    serializedData: string;
    sendOrder: number;

    constructor() {
        this.move = {x: 0, y: 0};
        this.action = {f: false, d: false};
        this.angle = 0;
        this.direction = new THREE.Vector3(1, 0, 0);
        this.timeStamp = 0;
        this.serializedData = '';
        this.sendOrder = 1;
    }

    reset() {
        this.sendOrder = 1;
        this.action = {f: false, d: false};
        this.move = {x: 0, y: 0};
        this.angle = 0;
        this.direction = new THREE.Vector3(1, 0, 0);
        this.timeStamp = 0;
        this.serializedData = '';
    }

    serializeForSend(): {order: number, info: string} {
        this.serialize();
        let order = this.sendOrder;
        let data = {
            order,
            info: this.serializedData
        }
        this.sendOrder++;
        return data;
    }

    numberEncode(n: number): string {
        n = n * 10 + 10;
        return n.toString(36);
    }

    numberDecode(n: string): number {
        return (parseInt(n, 36) - 10) / 10;
    }

    getSerializedData() {
        return this.serializedData;
    }

    serialize(): string {
        let actionComb = <number>(<unknown>this.action.f) * 1
                        + <number>(<unknown>this.action.d) * 2;
        let x = this.numberEncode(this.move.x);
        let y = this.numberEncode(this.move.y);
        let info = `${x}${y}${actionComb}`;
        info += `${this.angle}|${this.direction.toArray()}|`;
        info += this.timeStamp.toString(36);
        this.serializedData = info;

        return this.serializedData;
    }

    deserialize(data: string) {
        if (!data)
            return;
        this.move = {x: this.numberDecode(data[0]) , y: this.numberDecode(data[1])};
        let actionComb = Number(data[2]);
        this.action.f = Boolean(actionComb >>> 0 & 1);
        this.action.d = Boolean(actionComb >>> 1 & 1);
        let others = data.slice(3).split('|');
        this.angle = Number(others[0]);
        let directionArray = others[1].split(',').map(parseFloat);
        this.direction.fromArray(directionArray);
        this.timeStamp = parseInt(others[2], 36);
    }

    static findTimeStamp(data: string): number {
        let others = data.slice(3).split('|');
        let timeStamp = parseInt(others[2], 36);
        return timeStamp;
    }

    calcMovementVector(frontVector: THREE.Vector3): THREE.Vector3 {
        var speedVect = new THREE.Vector3(0, 0, 0);
        const sideOnPlane = frontVector.clone().cross(new THREE.Vector3(0, 1, 0));
        let move = this.move;
    
        speedVect.addScaledVector(frontVector, move.x);
        speedVect.addScaledVector(sideOnPlane, move.y);
        speedVect.normalize();
        speedVect.x = Math.round(speedVect.x * 10);
        speedVect.z = Math.round(speedVect.z * 10);
        return speedVect;
    }

    fire() {
        return this.action.f;
    }

    set(move: Move, angle: number, direction: THREE.Vector3,
        action: GameAction, timeStamp: number) {
        this.move = {x: move.x, y: move.y};
        this.angle = angle;
        this.direction = direction.clone();
        this.action = {f: action.f, d: action.d};
        this.timeStamp = timeStamp;

        return this;
    }
}


export class Player extends THREE.Object3D {
    radius: number;
    core: THREE.Mesh;
    cannon: CannonObject;

    initPosition: THREE.Vector3;
    speedRate: number;

    fireRate: number;
    bulletDelay: number;
    lastFire: number;
    fired: boolean;

    inputs: Inputs;
    actions: Map<number, Inputs>;

    oldPosition: THREE.Vector3;
    movementVector: THREE.Vector3;
    positionBackup: THREE.Vector3;

    scene: THREE.Scene;
    planeFacingVector: THREE.Vector3;

    bulletSound: THREE.Audio;
    bulletManager: PlayersBulletManager;
    rollback: Rollback;
    
    plane: Plane | undefined;
    health: number ;
    maxHealth: number;
    hits: Map<number, boolean> = new Map();
    alive: boolean;
    UiRenderer: UIRanderer;

    signalEndGame: (timeStamp: number) => void;

    constructor(position: THREE.Vector3,
        bulletManager: PlayersBulletManager) {
        super();
        let size = 700;
        this.radius = size * 1.5;
        var core = createCore(size);
        var cannon = createCannon(size);
        this.core = core;
        this.cannon = cannon;
        this.add(core);
        this.add(cannon);

        this.position.set(position.x, position.y, position.z);
        this.initPosition = this.position.clone();
        let scale = 2;
        this.scale.set(scale, scale, scale);
        this.speedRate = 2;

        this.fireRate = 100;
        this.bulletDelay = 100;
        this.lastFire = 0;
        this.fired = false;

        this.inputs = new Inputs();
        this.rollback = new Rollback();

        this.oldPosition =  this.position.clone();
        this.movementVector = new THREE.Vector3();
        this.actions = new Map();
        
        this.setBulletManager(bulletManager);
        this.positionBackup = this.position.clone();
        this. maxHealth = 10;
        this.health = this.maxHealth;
        this.alive = true;
    };

    reset() {
        this.hits.clear();
        this.inputs.reset();
        this.lastFire = 0;
        this.position.copy(this.initPosition);
        this.oldPosition.set(0, 0, 0);
        this.positionBackup.copy(this.position);
        this.health = this.maxHealth;
        this.alive = true;
        if (this.name === 'player')
            this.UiRenderer.updatePlayer1Health(this.health / this.maxHealth);
        else if (this.name === 'foe')
            this.UiRenderer.updatePlayer2Health(this.health / this.maxHealth);
    }

    stop() {
        this.inputs.reset();
    }

    gotHit(time: number) {
        this.hits.set(time, true);
    }

    rollbackcheckHit(time: number, value: boolean) {
        let oldValue =this.hits.get(time);
        if (oldValue === undefined)
            this.gotHit(time);
        else if (value === false)
            this.hits.delete(time);
    }

    countHits() {
        return this.hits.size;
    }

    attachEndGameSignal(signal: (timeStamp: number) => void) {
        this.signalEndGame = signal;
    }

    addUIRenderer(uiRenderer: UIRanderer) {
        this.UiRenderer = uiRenderer;
    }

    takeDamage(damage: number, timeStamp: number, scope: string = "animate") {
        if(scope === "animate")
            this.gotHit(timeStamp);
        else if (scope === "rollback")
            this.rollbackcheckHit(timeStamp, false);
        this.health = this.maxHealth - this.countHits();
        if (this.health < 0)
            return;
        if (this.health <= 0) {
            this.alive = false;
            this.signalEndGame(timeStamp);
        }
        if (this.name === 'player')
            this.UiRenderer.updatePlayer1Health(this.health / this.maxHealth);
        else if (this.name === 'foe')
            this.UiRenderer.updatePlayer2Health(this.health / this.maxHealth);
    }

    addToScene(scene: THREE.Scene) {
        this.scene = scene;
		scene.add(this);
	}

    setPlane(plane: Plane) {
        this.plane = plane;
    }

    setPlaneVector(planeFacingVector: THREE.Vector3) {
        planeFacingVector.normalize();
        planeFacingVector.x = parseFloat(planeFacingVector.x.toFixed(1));
        planeFacingVector.y = parseFloat(planeFacingVector.y.toFixed(1));
        planeFacingVector.z = parseFloat(planeFacingVector.z.toFixed(1));
        this.planeFacingVector = planeFacingVector;
    }

    addBulletSound(sound: THREE.Audio) {
        this.bulletSound = sound;
    }

    setBulletManager(bulletManager) {
        this.bulletManager = bulletManager;
    }

    getBulletManager() {
        return this.bulletManager;
    }

    despawnUncertainBullets(time) {
        time = time - this.bulletDelay;
        this.bulletManager.bullets.forEach(bullet => {
            if (bullet.date > time) {
                this.bulletManager.despawnBullet(bullet);
            }
        });
        this.bulletManager.destroyedBullets.forEach(bullet => {
            if (bullet.date > time) {
                this.bulletManager.returnDestroyedBullet(bullet);
            }
        });
    }

    rollbackActoin(action, lastActionTime, actionTime) {
    }

    rollBack(receivedData: string, lastTime: number, actionTime: number, frameIndex: number) {
        let rollBackData = this.rollback.rollbackFrame(frameIndex) as RollData;
        let rollBackInputs = rollBackData.input;

        for (let i = 0; i < rollBackInputs.length - 1; i++) { // handle before last inputs
            let nextInput = rollBackInputs[i + 1];
            let nextActionTime = Inputs.findTimeStamp(nextInput);

            this.rollbackNextAction(nextInput, lastTime, nextActionTime);
            lastTime = nextActionTime;
        }

        this.rollbackNextAction(receivedData, lastTime, actionTime);
    }

    rollbackNextAction(nextInput: string, lastTime: number, actionTime: number) {
        let spanS = (actionTime - lastTime);
        this.update(spanS, lastTime, 0);
        this.inputs.deserialize(nextInput);
    }

    floorPosition(position: THREE.Vector3) {
        position.x = Math.floor(this.position.x * 1000) / 1000;
        position.z = Math.floor(this.position.z * 1000) / 1000;
        return position;
    }
    
    update(timeS: number, timeStamp: number, actionTime: number) {
        let speed = this.speedRate * timeS;
        const projectionOnPlane = this.planeFacingVector;
        
        this.core.rotateY(0.1);
        this.cannon.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), this.inputs.angle);

        this.movementVector.copy(this.inputs.calcMovementVector(projectionOnPlane));

        this.oldPosition.copy(this.position);
        this.position.addScaledVector(this.movementVector, speed);
        this.plane?.keepInside(this.position, this.radius);
        this.fired = this.fire(timeStamp, timeS);

        if (!this.position.equals(this.positionBackup)) {
            this.positionBackup.copy(this.position);
        }
 
    }

    UpdateRollbackVariables(frameIndex: number) {
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        data.position.copy(this.position);
        data.speed.copy(this.movementVector);
        data.lastFire = this.lastFire;
        data.health = this.health;
    }

    savePlayerData(frameIndex: number) {
        return this.rollback.saveFrame(frameIndex, this.position.clone(),
                this.movementVector, this.inputs.serialize(),
                this.lastFire, this.health);
    }

    saveRollBackData(frameIndex: number) {
        let rollBackData = this.rollback.rollbackFrame(frameIndex);
        if (!rollBackData)
            return;
        rollBackData.addInput(this.inputs.serialize());
    }

    addRollBackAction(timeStamp: number) {
    }

    addAction(timeStamp: number) {
    }

    restoreFrameInput(frameIndex: number) {
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        let input = this.inputs;
        input.deserialize(data.input[0]);
    }

    _findStateInFrame(frameIndex : number) {
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        let input = this.inputs;
        input.deserialize(data.input[0]);
        
        this.movementVector.copy(data.speed);
        this.position.copy(data.position);
        this.lastFire = data.lastFire;
        this.health = data.health;
    }

    findStateAtTime(time: number) {
    }

    _findPositonInFrame(frameIndex: number) {
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;

        this.oldPosition.copy(data.position);
        this.movementVector.copy(data.speed);
        this.position.copy(this.oldPosition)
        .addScaledVector(this.movementVector, 1);
        this.health = data.health;
    }

    findPositionAtTime(time: number) {
        let iterator = this.actions.entries();
        let action = iterator.next().value;
        let previousAction;
        while (action) {
            if (action[0] < time) {
                if (previousAction)
                    this.actions.delete(previousAction[0]);
                previousAction = action;
                action = iterator.next().value;
            }
            else
                break;
        }
        if (!previousAction)
            return;
        this.oldPosition.copy(previousAction[1].startPosition);
        this.movementVector.copy(previousAction[1].movementVector);
        this.position.copy(this.oldPosition).addScaledVector(this.movementVector, 1);
    }

    getCurrentPosition(radius: number) {
        let vect = new THREE.Vector3();
        vect.copy(this.movementVector).normalize();
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(this.movementVector, radius);
        return point;
    }

    getOldPosition(radius: number, s: number) {
        let vect = new THREE.Vector3();
        vect.copy(this.movementVector).normalize();
        let point = new THREE.Vector3();
        point.copy(this.oldPosition);
        point.addScaledVector(this.movementVector, - radius);
        return point;
    }

    lastPosition(s: number) {
        return this.oldPosition;
    }

    fire(time: number, span: number): boolean {
        if (!this.inputs.fire()) {
            if (this.cannon.head.position.z < (this.radius)/ 1.5 * -2.2)
                this.cannon.head.position.z += 10;
            return false;
        }
        if (this.cannon.head.position.z > (this.radius) / 1.5 * -2.5)
            this.cannon.head.position.z -= 5;

        let start = this.lastFire + this.fireRate;
        if (start < time) {
            start = time;
        }
        let end = time + span;
        while (start < end) {
            this.lastFire = start;
            let spawnTime = this.lastFire - this.bulletDelay;
            this.bulletManager.spawnBullet(0xffffff, this.position,
                this.inputs.direction.clone(), this.inputs.angle, spawnTime);
            
            this.bulletSound.stop();
            this.bulletSound.setDetune((0.5 - Math.random()) * 50)
            this.bulletSound.play();
            start += this.fireRate;
        }
        return true;

    }
}



function createCore(scale: number): THREE.Mesh {
    const geometry = new THREE.CapsuleGeometry( scale, 1, 4, 6 )
    const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 0.3, emissive: 0x777777, emissiveIntensity: 0.8} );
    const core = new THREE.Mesh( geometry, material );
    core.name = 'core';
    core.position.set(0, 0, 0);
    return core;
}

class CannonObject extends THREE.Object3D {
    head: THREE.Mesh;
    constructor(scale: number = 70) {
        super();
        const invisibleCore = createCore(70);
        invisibleCore.visible = false;

        const geometry = new THREE.CylinderGeometry( 0, 0.7, 1.5, 6 );
        const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 0.1, emissive: 0xeeeef7, emissiveIntensity: 0.8} );
        const cannonHead = new THREE.Mesh( geometry, material );
        cannonHead.name = 'cannonHead';
        cannonHead.scale.set(scale, scale, scale);
        cannonHead.position.y = 0;
        cannonHead.position.z = -2.2 * scale;
        cannonHead.position.x = 0;
        cannonHead.rotateX(- Math.PI / 2);
        this.head = cannonHead;
        this.add(invisibleCore);
        this.add(cannonHead);
        this.name = 'cannon';
    }
}

function createCannon(scale: number): CannonObject {
    const cannon = new CannonObject(scale);
    return cannon;
}