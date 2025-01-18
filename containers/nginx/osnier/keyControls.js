// @ts-ignore
// @ts-nocheck
import * as THREE from './three/three.module.js';
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
    speedVector(frontVector) { }
    ;
    fire() { }
    ;
}
export class KeyControls extends Controls {
    mouse;
    camera;
    gameConvas;
    convasRect;
    Wkey;
    Akey;
    Skey;
    Dkey;
    shift;
    Jkey;
    Lclick;
    raycaster;
    plane;
    angle;
    direction;
    move;
    action;
    handled;
    constructor(camera, gameConvas, props = {}) {
        super();
        Object.assign(this, {
            Wkey: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Akey: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Skey: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Dkey: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            shift: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Jkey: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Lclick: { press: null, pressVal: false, hold: false, release: null, releaseVal: false },
        }, props);
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.mouse = new THREE.Vector2(1, 1);
        if (!camera)
            throw new Error('KeyControls: camera is required');
        this.camera = camera;
        this.gameConvas = gameConvas;
        this.convasRect = this.gameConvas.getBoundingClientRect();
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
    findPlayerMove() {
        let move = {
            x: this.Wkey.hold - this.Skey.hold,
            y: this.Dkey.hold - this.Akey.hold
        };
        return move;
    }
    findPlayerAction() {
        let action = {
            f: this.Lclick.hold,
            d: this.shift.hold,
        };
        return action;
    }
    findPlayerAngle(playerPosition) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, intersection);
        if (intersection) {
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
        return { angle: this.angle, direction: this.direction.clone() };
    }
    recalibrateMouse() {
        this.convasRect = this.gameConvas.getBoundingClientRect();
    }
    onMouseMove(event) {
        this.handled = false;
        event.preventDefault();
        const rect = this.convasRect;
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    speedVector(frontVector) {
        var speedVect = new THREE.Vector3(0, 0, 0);
        const sideOnPlane = frontVector.clone().cross(new THREE.Vector3(0, 1, 0));
        let move = this.findPlayerMove();
        speedVect.addScaledVector(frontVector, move.y);
        speedVect.addScaledVector(sideOnPlane, move.x);
        speedVect.normalize();
        return speedVect;
    }
    fire() {
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
        this.gameConvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.gameConvas.addEventListener('mousedown', (e) => {
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
        });
    }
    keyupListener() {
        this.gameConvas.addEventListener('mouseup', (e) => {
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
        });
    }
}
export function getCameraDir(camera) {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const projection = dir.projectOnPlane(new THREE.Vector3(0, 1, 0));
    return projection;
}
