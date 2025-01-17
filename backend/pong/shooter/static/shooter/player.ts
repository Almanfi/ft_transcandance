import * as THREE from 'three';
import { Move, GameAction } from './keyControls.js';
import { PlayersBulletManager, Plane } from './assets.js';
import { Rollback, dataSaved, RollData } from './rollback.js';


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
        // speedVect.x = parseFloat(speedVect.x.toFixed(1));
        // speedVect.z = parseFloat(speedVect.z.toFixed(1));
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

    // uncomment for bullet sound
    bulletSound: THREE.Audio;
    bulletManager: PlayersBulletManager;
    rollback: Rollback;
    
    plane: Plane | undefined;
    health: number ;
    maxHealth: number;
    alive: boolean;
    // planeRaycaster: THREE.Raycaster;

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

        // this.planeRaycaster = new THREE.Raycaster();
    };

    reset() {
        this.inputs.reset();
        // this.actions.clear();
        this.lastFire = 0;
        this.position.set(0, 0, 0);
        this.oldPosition.set(0, 0, 0);
        this.positionBackup.copy(this.position);
        this.health = this.maxHealth;
        this.alive = true;
    }

    takeDamage(damage: number) {
        if (!this.alive)
            return;
        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
            console.log('player died: ', this.name);
            // endGame();
        }
        console.log(`${this.name} health: `, this.health);
        // updateHealthBar();
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

    // attachControls(controls) {
    //     this.controls = controls;
    // }

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
        // console.log('despawning bullets after time: ', time);
        this.bulletManager.bullets.forEach(bullet => {
            if (bullet.date > time) {
                console.log('despawning bullet fired last at: ', bullet.date);
                this.bulletManager.despawnBullet(bullet);
            }
        });
        this.bulletManager.destroyedBullets.forEach(bullet => {
            if (bullet.date > time) {
                console.log('despawning bullet');
                this.bulletManager.returnDestroyedBullet(bullet);
            }
        });
    }

    rollbackActoin(action, lastActionTime, actionTime) {
        
        // let spanS = (action.timeStamp - lastActionTime);
        // // console.log('rolling back action old actionat time: ', lastActionTime, " to: ", action.timeStamp);
        // // console.log(`at time of old action: ${lastActionTime}: position: ${JSON.stringify(this.position)}`);
        // this.update(spanS, action.timeStamp, actionTime);
        // // console.log(`at time of new action: ${action.timeStamp}: position: ${JSON.stringify(this.position)}`);
        // this.controls.applyAction(action);
    }

    rollBack(receivedData: string, lastTime: number, actionTime: number, frameIndex: number) {
        let rollBackData = this.rollback.rollbackFrame(frameIndex) as RollData;
        let rollBackInputs = rollBackData.input;
        // console.log(`rolling back from ${lastTime} to ${actionTime}`);

        for (let i = 0; i < rollBackInputs.length - 1; i++) { // handle before last inputs
            console.log("handling in between inputs");
            let nextInput = rollBackInputs[i + 1];
            let nextActionTime = Inputs.findTimeStamp(nextInput);

            this.rollbackNextAction(nextInput, lastTime, nextActionTime);
            lastTime = nextActionTime;
            console.log("done handling in between inputs");
        }

        this.rollbackNextAction(receivedData, lastTime, actionTime);
    }

    rollbackNextAction(nextInput: string, lastTime: number, actionTime: number) {
        // console.log(`before at time : ${lastTime} action : `, JSON.stringify(this.position));
        let spanS = (actionTime - lastTime);
        this.update(spanS, lastTime, 0);
        // console.log(`after at time : ${actionTime} action : `, JSON.stringify(this.position));
        this.inputs.deserialize(nextInput);
    }

    // rollBack(timeStamp) {
    //     // this.position.copy(this.controls.position);
    //     // this.oldPosition.copy(this.position);
    //     // this.movementVector.copy(this.controls.movementVector);
    //     // this.position.addScaledVector(this.movementVector, 1);
    //     // if (this.controls.wasFired())
    //     // {
    //     //     this.lastFire = timeStamp;
    //     //     this.fired = this.fire(timeStamp);
    //     // }
    //     // this.addRollBackAction(timeStamp);
    // }

    floorPosition(position: THREE.Vector3) {
        position.x = Math.floor(this.position.x * 1000) / 1000;
        position.z = Math.floor(this.position.z * 1000) / 1000;
        return position;
        // this.position.y = this.position.y;// no chango for y
    }
    
    update(timeS: number, timeStamp: number, actionTime: number) {
        let speed = this.speedRate * timeS;
        // let speed = timeS
        const projectionOnPlane = this.planeFacingVector;
        
        this.core.rotateY(0.1);
        // this.cannon.head.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.05);
        this.cannon.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), this.inputs.angle);

        this.movementVector.copy(this.inputs.calcMovementVector(projectionOnPlane));

        this.oldPosition.copy(this.position);
        // this.oldMovementVector.copy(this.movementVector);
        // console.log(`movement vector: of ${this.name}`, this.movementVector);
        // this.movementVector.multiplyScalar(speed);

        // console.log(`movement vector: `, JSON.stringify(this.movementVector));

        this.position.addScaledVector(this.movementVector, speed);

        this.plane?.keepInside(this.position, this.radius);
        // this.floorPosition(this.position);
        // if (this.controls.sendActionToPeer && this.saveAction) {
            //     this.currInput = {};
            //     this.currmouse = {};
            //     if (this.controls.Wkey.hold !== this.move.up)
        //         this.currInput.up = this.controls.Wkey.hold;
        //     if (this.controls.Skey.hold !== this.move.down)
        //         this.currInput.down = this.controls.Skey.hold;
        //     if (this.controls.Akey.hold !== this.move.left)
        //         this.currInput.left = this.controls.Akey.hold;
        //     if (this.controls.Dkey.hold !== this.move.right)
        //         this.currInput.right = this.controls.Dkey.hold;
        //     if (this.controls.Lclick.hold !== this.mouse.Lclick)
        //         this.currMouseInput.Lclick = this.controls.Lclick.hold;
        //     Object.assign(this.mouse, this.currMouseInput);
        //     Object.assign(this.move, this.currInput);
        // }
        // this.addAction(actionTime);
        
        // if (new Date().valueOf() - this.lastFire > 70)
        this.fired = this.fire(timeStamp, timeS);
        // if (this.fired) {
            //     console.log(`timeStamp: ${timeStamp}, frameTime: ${actionTime}`);
            // }
        if (!this.position.equals(this.positionBackup)) {
            this.positionBackup.copy(this.position);
            // console.log(`+position of ${this.name} at time: ${timeStamp} is: `, JSON.stringify(this.oldPosition));
            // console.log(` -position of ${this.name} at time: ${timeStamp + timeS} is: `, JSON.stringify(this.position));
        }
 
    }

    UpdateRollbackVariables(frameIndex: number) {
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        data.position.copy(this.position);
        data.speed.copy(this.movementVector);
        data.lastFire = this.lastFire;
    }

    savePlayerData(frameIndex: number) {
        // let currMoveVect = this.inputs.calcMovementVector(this.planeFacingVector).clone();
        return this.rollback.saveFrame(frameIndex, this.position.clone(),
                this.movementVector, this.inputs.serialize(),
                this.lastFire);
    }

    saveRollBackData(frameIndex: number) {
        let rollBackData = this.rollback.rollbackFrame(frameIndex);
        if (!rollBackData)
            return;
        rollBackData.addInput(this.inputs.serialize());
    }

    addRollBackAction(timeStamp: number) {
        // let action = {
        //     startPosition: this.oldPosition,
        //     movementVector: this.movementVector,
        //     fire: this.fired,
        //     move: this.controls.move,
        //     angle: this.controls.angle,
        //     direction: this.controls.direction,
        //     Lclick: this.controls.Lclick,
        //     timeStamp: timeStamp,
        //     frame: 0,
        // }
        // this.actions.set(timeStamp, action);
    }

    addAction(timeStamp: number) {
        // let action = {
        //     startPosition: this.oldPosition.clone(),
        //     movementVector: this.oldMovementVector.clone(),
        //     move: {...this.controls.move},
        //     angle: this.controls.angle,
        //     direction: this.controls.direction.clone(),
        //     Lclick: this.controls.Lclick,
        //     lastFire: this.lastFire,
        //     timeStamp: timeStamp,
        // }
        // this.actions.set(timeStamp, action);
        // if (this.controls.sendActionToPeer && this.saveAction) {
        //     this.saveAction = false;
        //     let data = {}
        //     // data.position = this.oldPosition;
        //     // data.movementVector = this.movementVector;
        //     data.move = this.currInput;
        //     data.angle = this.controls.angle;
        //     data.direction = this.controls.direction;
        //     data.mouse = this.currMouseInput;
        //     // data.fired = this.fired;
        //     data.timeStamp = timeStamp;
        //     this.controls.sendActionToPeer(data);
        // }
    }

    restoreFrameInput(frameIndex: number) {
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        let input = this.inputs;
        input.deserialize(data.input[0]);
    }

    _findStateInFrame(frameIndex : number) { // '_' for unsafe
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        // let oldData = this.rollback.rollbackFrame(frameIndex - 1) as dataSaved;
        let input = this.inputs;
        input.deserialize(data.input[0]);

        // this.oldPosition.copy(oldData.position);
        this.movementVector.copy(data.speed);
        this.position.copy(data.position);
        // .addScaledVector(this.movementVector, 1);
        this.lastFire = data.lastFire;
    }

    findStateAtTime(time: number) {
        // let iterator = this.actions.entries();
        // let action = iterator.next().value;
        // let previousAction  = null;
        // while (action) {
        //     if (action[0] < time) {
        //         // if (action[0] + 500 > time)
        //         //     console.log('previous state at time: ', action[0], " pos: ", action[1].startPosition, " vect: ", action[1].movementVector);
        //         // if (previousAction) {
        //         //     this.actions.delete(previousAction[0]);
        //         // }
        //         previousAction = action;
        //         action = iterator.next().value;
        //     }
        //     else
        //         break;
        // }
        // // if (previousAction)// later
        // //     action = previousAction;

        // if (!action)
        //     return;
        // // this.position.copy(action[1].startPosition).addScaledVector(action[1].movementVector, 1);
        // this.position.copy(action[1].startPosition);
        // // console.log("old action at frame time: ", time, " action: ", JSON.stringify(action[1]));
        // this.controls.move = action[1].move;
        // this.controls.angle = action[1].angle;
        // this.controls.direction = action[1].direction;
        // this.controls.Lclick = action[1].Lclick;
        // this.lastFire = action[1].lastFire;
        // console.log('last state position: ', action[1].startPosition,
        // 'movement vector: ', action[1].movementVector,
        // ' at action time: ', action[0], "at time: ", time);
        // // console.log("last fired of action: ", action[1].lastFire, " and of prev action: ", previousAction[1].lastFire);
        // this.actions.clear();
    }

    _findPositonInFrame(frameIndex: number) { // '_' for unsafe
        let data = this.rollback.rollbackFrame(frameIndex) as dataSaved;
        // let input = this.inputs
        // input.deserialize(data.input);

        this.oldPosition.copy(data.position);
        this.movementVector.copy(data.speed);
        this.position.copy(this.oldPosition)
        .addScaledVector(this.movementVector, 1);
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
            // console.log(`start: ${start} < time: ${time}`);
            start = time;
        }
        // console.log(`start: ${start}, time: ${time}`)
        let end = time + span;
        // if (end <= start) {
        //     console.log(`warning: end: ${end} >= start: ${start}`);
        // }
        while (start < end) {
            // console.log('fired last at : ', this.lastFire);
            this.lastFire = start;
            let spawnTime = this.lastFire - this.bulletDelay;
            // console.log('fired at : ', this.lastFire);
            this.bulletManager.spawnBullet(0xffffff, this.position,
                this.inputs.direction.clone(), this.inputs.angle, spawnTime);
            
            // uncomment for bullet sound
            this.bulletSound.stop();
            this.bulletSound.setDetune((0.5 - Math.random()) * 50)
            this.bulletSound.play();
            
            
            // console.log('fire rate: ', this.fireRate, `start: ${start}, end: ${end}, timeS: ${spanS}`);
            // console.log("bullet nbr ", this.bulletManager.bullets.size);
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