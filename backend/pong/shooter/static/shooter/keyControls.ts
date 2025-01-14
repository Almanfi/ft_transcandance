import * as THREE from 'three';

function release() {
    if (!this.releaseVal)
        return false;
    this.releaseVal = false;
    return true;
}

function press() {
    if (!this.pressVal)
        return false;
    this.pressVal = false;
    return true;
}

export class Controls {
    speedVector(frontVector: THREE.Vector3) {};
    fire() {};
}

export type Move = {
    x: number,
    y: number,
}

// export class PlayerData extends Controls {
//     move: Move;
    

//     constructor(player) {
//         super();
//         this.move = {
//             up: false,
//             down: false,
//             left: false,
//             right: false,
//         }
//         this.player = player;
//         this.angle = 0;
//         this.direction = new THREE.Vector3(0, 0, 0);
//         this.Lclick = false;
//         this.newState = false;
//         this.oldTimeStamp = 0;
//         if (this.player)
//             this.backUpPosition = new THREE.Vector3().copy(this.player.position);
//         this.backUp = {
//             timestamp: 0,
//             position: new THREE.Vector3(0, 0, 0),
//             move: {...this.move},
//         }
//         this.position = new THREE.Vector3(0, 0, 0);
//         this.movementVector = new THREE.Vector3(0, 0, 0);
//         this.fired = false;
//         this.actions = new Map();
//         this.rollback = false;
//         this.actionOrder = 0;
//     }

//     makeBackup(data) {
//         this.rollback = true;
//         this.actions.set(data.actionOrder, data);
//     }

//     wasFired() {
//         if (this.fired) {
//             this.fired = false;
//             return true;
//         }
//         return false;
//     }

//     applyAction(data) {
//         if (data.move)
//             this.move = Object.assign(this.move, data.move);
//         // if (data.position) {
//         //     this.position.copy(data.position);
//         // }
//         // else
//         //     this.position = null;
//         // if (data.movementVector)
//         //     this.movementVector.copy(data.movementVector);
//         if (data.direction)
//             this.direction.copy(data.direction);
//         if (data.angle)
//             this.angle = data.angle;
//         if (data.mouse)
//             this.Lclick = data.mouse.Lclick;
//         // this.fired = data.fired;
//     }

//     speedVector(frontVector) {
//         var speedVect = new THREE.Vector3(0, 0, 0);
//         const sideOnPlane = frontVector.clone().cross(new THREE.Vector3(0, 1, 0));
    
//         speedVect.addScaledVector(frontVector, this.move.up - this.move.down);
//         speedVect.addScaledVector(sideOnPlane, this.move.right - this.move.left);
//         speedVect.normalize();
//         return speedVect;
//     }
//     fire() {
//         return this.Lclick;
//     }
// }

type gameKey = {
    press: () => boolean,
    pressVal: boolean,
    hold: boolean,
    release: () => boolean,
    releaseVal: boolean,
}

export type GameAction = {
    f: boolean,
    d: boolean,
}

export class KeyControls extends Controls {
    mouse: THREE.Vector2;
    camera: THREE.PerspectiveCamera;

    Wkey: gameKey;
    Akey: gameKey;
    Skey: gameKey;
    Dkey: gameKey;
    shift: gameKey;
    Jkey: gameKey;
    Lclick: gameKey;

    raycaster: THREE.Raycaster;
    plane: THREE.Plane;
    angle: number;
    direction: THREE.Vector3;
    move: Move;
    action: GameAction;

    handled: boolean;

    constructor (camera, props = {}) {
        super();
        Object.assign(this, {
            Wkey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Akey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Skey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Dkey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            shift: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Jkey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Lclick: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
        }, props);

        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.mouse = new THREE.Vector2( 1, 1 );
        if (!camera)
            throw new Error('KeyControls: camera is required');
        this.camera = camera;
        this.angle = 0;
        this.direction = new THREE.Vector3(0, 0, 0);
        this.move = { x: 0, y: 0 };
        this.action = { f: false, d: false };

        this.Wkey.press = press.bind(this.Wkey);
        this.Akey.press = press.bind(this.Akey);
        this.Skey.press = press.bind(this.Skey);
        this.Dkey.press = press.bind(this.Dkey);
        this.shift.press = press.bind(this.shift);
        this.Jkey.press = press.bind(this.Jkey);
        this.Lclick.press = press.bind(this.Lclick);

        this.Wkey.release = release.bind(this.Wkey);
        this.Akey.release = release.bind(this.Akey);
        this.Skey.release = release.bind(this.Skey);
        this.Dkey.release = release.bind(this.Dkey);
        this.shift.release = release.bind(this.shift);
        this.Jkey.release = release.bind(this.Jkey);

        this.keydownListener();
        this.keyupListener();
        this.handled = true;
    }

    findPlayerMove(): Move {
        let move: Move = {
            x: <number>(<unknown>this.Wkey.hold) - <number>(<unknown>this.Skey.hold),
            y: <number>(<unknown>this.Dkey.hold) - <number>(<unknown>this.Akey.hold)
        };
        return move;
    }

    findPlayerAction(): GameAction {
        let action: GameAction = {
            f: this.Lclick.hold,
            d: this.shift.hold,
        }
        return action;
    }

    findPlayerAngle(playerPosition: THREE.Vector3): {angle: number, direction: THREE.Vector3} {
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, intersection);

        if ( intersection ) {
            const point = intersection;
            
            let dx = point.x - playerPosition.x;
            let dz = point.z - playerPosition.z;
            if (dz)
                this.angle = Math.atan(dx / dz) + 0 * Math.PI / 2;
            if (dz > 0) {
                this.angle += 1 * Math.PI;
           }
           this.direction.set(dx, 0, dz).normalize();
        }
        return {angle: this.angle, direction: this.direction.clone()};
    }

    onMouseMove( event ) {
        this.handled = false;
        event.preventDefault();
    
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }



    speedVector(frontVector: THREE.Vector3): THREE.Vector3 {
        var speedVect = new THREE.Vector3(0, 0, 0);
        const sideOnPlane = frontVector.clone().cross(new THREE.Vector3(0, 1, 0));
        let move = this.findPlayerMove();
    
        speedVect.addScaledVector(frontVector, move.y);
        speedVect.addScaledVector(sideOnPlane, move.x);
        speedVect.normalize();
        return speedVect;
    }

    fire(): boolean {
        return this.Lclick.hold;
    }

    setAsHandeled() {
        this.handled = true;
    }

    checkforNewInputs() {
        let value = !this.handled;
        // this.handled = true;
        return value;
    }
    
    keydownListener() {
        window.addEventListener( 'mousemove', this.onMouseMove.bind(this) );
        window.addEventListener('mousedown', (e) => {
            if (!this.Lclick.hold)
                this.handled = false;
                this.Lclick.pressVal = true;
            this.Lclick.hold = true;
        });
        window.addEventListener('keydown', (e) => {
            // this.handled = false;
            switch (e.code) {
                case 'KeyW':
                    if (!this.Wkey.hold) {
                        this.handled = false;
                        this.Wkey.pressVal = true;
                    }
                    this.Wkey.hold = true;
                    break;
                case 'KeyA':
                    if (!this.Akey.hold) {
                        this.handled = false;
                        this.Akey.pressVal = true;
                    }
                    this.Akey.hold = true;
                    break;
                case 'KeyS':
                    if (!this.Skey.hold) {
                        this.handled = false;
                        this.Skey.pressVal = true;
                    }
                    this.Skey.hold = true;
                    break;
                case 'KeyD':
                    if (!this.Dkey.hold) {
                        this.handled = false;
                        this.Dkey.pressVal = true;
                    }
                    this.Dkey.hold = true;
                    break;
                case 'ShiftLeft':
                    if (!this.shift.hold) {
                        this.handled = false;
                        this.shift.pressVal = true;
                    }
                    this.shift.hold = true;
                    break;
                case 'KeyJ':
                    if (!this.Jkey.hold) {
                        this.handled = false;
                        this.Jkey.pressVal = true;
                    }
                    this.Jkey.hold = true;
                    break;
                default:
                    break;
                }
            })
        }

        keyupListener() {
            window.addEventListener('mouseup', (e) => {
                this.handled = false;
                this.Lclick.releaseVal = true;
                this.Lclick.hold = false;
            });
            window.addEventListener('keyup', (e) => {
            this.handled = false;
            switch (e.code) {
                case 'KeyW':
                    this.Wkey.releaseVal = true;
                    this.Wkey.hold = false;
                    break;
                case 'KeyA':
                    this.Akey.releaseVal = true;
                    this.Akey.hold = false;
                    break;
                case 'KeyS':
                    this.Skey.releaseVal = true;
                    this.Skey.hold = false;
                    break;
                case 'KeyD':
                    this.Dkey.releaseVal = true;
                    this.Dkey.hold = false;
                    break;
                case 'ShiftLeft':
                    this.shift.releaseVal = true;
                    this.shift.hold = false;
                    break;
                case 'KeyJ':
                    this.Jkey.releaseVal = true;
                    this.Jkey.hold = false;
                    break;
                default:
                    break;
            }
        })
    }
}

export function getCameraDir(camera) {
   const dir = new THREE.Vector3();
   camera.getWorldDirection(dir);
   const projection = dir.projectOnPlane(new THREE.Vector3(0, 1, 0));
   return projection;
}
