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
    speedVector(frontVector) {};
    fire() {};
}

export class PlayerData extends Controls {
    constructor(player) {
        super();
        this.move = {
            up: false,
            down: false,
            left: false,
            right: false,
        }
        this.player = player;
        this.angle = 0;
        this.direction = new THREE.Vector3(0, 0, 0);
        this.Lclick = false;
        this.newState = false;
        this.oldTimeStamp = 0;
        if (this.player)
            this.backUpPosition = new THREE.Vector3().copy(this.player.position);
        this.backUp = {
            timestamp: 0,
            position: new THREE.Vector3(0, 0, 0),
            move: {...this.move},
        }
        this.actions = new Map();
        this.rollback = false;
    }

    makeBackup(data) {
        this.rollback = true;
        this.actions.set(data.timeStamp, data);
    }

    applyAction(data) {
        if (data.move)
            this.move = Object.assign(this.move, data.move);
        if (data.position) {
            this.position = data.position;
        }
        else
            this.position = null;
        if (data.direction)
            this.direction.copy(data.direction);
        if (data.angle)
            this.angle = data.angle;
        if (data.mouse)
            this.Lclick = data.mouse.Lclick;
    }

    speedVector(frontVector) {
        var speedVect = new THREE.Vector3(0, 0, 0);
        const sideOnPlane = frontVector.clone().cross(new THREE.Vector3(0, 1, 0));
    
        speedVect.addScaledVector(frontVector, this.move.up - this.move.down);
        speedVect.addScaledVector(sideOnPlane, this.move.right - this.move.left);
        speedVect.normalize();
        return speedVect;
    }
    fire() {
        return this.Lclick;
    }
}


export class KeyControls extends Controls {
    constructor (player, camera, props = {}) {
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

        this.player = player;
        this.player.controls = this;
        this.socket = null;
        this.data = null;
        this.connection = null;

        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.mouse = new THREE.Vector2( 1, 1 );
        if (!camera)
            throw new Error('KeyControls: camera is required');
        this.camera = camera;
        this.angle = 0;
        this.sentAngle = 0;
        this.accurateAngleCounter = 0;
        this.direction = new THREE.Vector3(0, 0, 0);

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
    }

    findPlayerAngle() {
        this.raycaster.setFromCamera( this.mouse, this.camera );

        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, intersection);
    
        // const intersection = this.raycaster.intersectObject( plane );
    
        if ( intersection ) {
            const point = intersection;
            
            let dx = point.x - this.player.position.x;
            let dz = point.z - this.player.position.z;
            if (dz)
                this.angle = Math.atan(dx / dz) + 0 * Math.PI / 2;
            if (dz > 0) {
                this.angle += 1 * Math.PI;
           }
           this.direction.set(dx, 0, dz).normalize();
        }
    }

    onMouseMove( event ) {
        event.preventDefault();
    
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        this.findPlayerAngle();
        if (!this.connection)
            return;
        this.accurateAngleCounter++;
        if (Math.abs(this.sentAngle - this.angle) > 0.06 || this.accurateAngleCounter % 6 === 0) {
            this.sentAngle = this.angle;
            this.send(JSON.stringify({direction: this.direction, angle: this.angle}));
        }
    }

    speedVector(frontVector) {
        var speedVect = new THREE.Vector3(0, 0, 0);
        const sideOnPlane = frontVector.clone().cross(new THREE.Vector3(0, 1, 0));
    
        speedVect.addScaledVector(frontVector, this.Wkey.hold - this.Skey.hold);
        speedVect.addScaledVector(sideOnPlane, this.Dkey.hold - this.Akey.hold);
        speedVect.normalize();
        return speedVect;
    }

    fire() {
        return this.Lclick.hold;
    }

    attachSocket(socket, reciever) {
        this.socket = socket;
        this.data = {
            "type": "chat.message",
            "friend_id": reciever,
            "message": {}
        };
        console.log('attaching socket');
    }

    attachConnection(connection) {
        this.connection = connection;
        this.send = connection.sendAdapter.bind(connection);
    }

    send(msg) {}

    sendToSocket(move, position, mouse) {
        let data = {};
        data.move = move;
        data.position = position ? position : undefined;
        
        this.send(JSON.stringify(data));
    }

    keydownListener() {
        window.addEventListener( 'mousemove', this.onMouseMove.bind(this) );
        window.addEventListener('mousedown', (e) => {
            if (!this.Lclick.hold)
                this.Lclick.pressVal = true;
            this.Lclick.hold = true;
            this.send(JSON.stringify({mouse: {Lclick: true}}));
        });
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW':
                    if (!this.Wkey.hold) {
                        this.sendToSocket({"up": true});
                        this.Wkey.pressVal = true;
                    }
                    this.Wkey.hold = true;
                    break;
                case 'KeyA':
                    if (!this.Akey.hold) {
                        this.sendToSocket({"left": true});
                        this.Akey.pressVal = true;
                    }
                    this.Akey.hold = true;
                    break;
                case 'KeyS':
                    if (!this.Skey.hold) {
                        this.sendToSocket({"down": true});
                        this.Skey.pressVal = true;
                    }
                    this.Skey.hold = true;
                    break;
                case 'KeyD':
                    if (!this.Dkey.hold) {
                        this.sendToSocket({"right": true});
                        this.Dkey.pressVal = true;
                    }
                    this.Dkey.hold = true;
                    break;
                case 'ShiftLeft':
                    if (!this.shift.hold) {
                        this.shift.pressVal = true;
                    }
                    this.shift.hold = true;
                    break;
                case 'KeyJ':
                    if (!this.Jkey.hold) {
                        this.connection.signalStart()
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
                this.Lclick.releaseVal = true;
                this.Lclick.hold = false;
                this.send(JSON.stringify({mouse: {Lclick: false}}));
            });
            window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                    this.sendToSocket({"up": false}, this.player.position);
                    this.Wkey.releaseVal = true;
                    this.Wkey.hold = false;
                    break;
                case 'KeyA':
                    this.sendToSocket({"left": false}, this.player.position);
                    this.Akey.releaseVal = true;
                    this.Akey.hold = false;
                    break;
                case 'KeyS':
                    this.sendToSocket({"down": false}, this.player.position);
                    this.Skey.releaseVal = true;
                    this.Skey.hold = false;
                    break;
                case 'KeyD':
                    this.sendToSocket({"right": false}, this.player.position);
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
