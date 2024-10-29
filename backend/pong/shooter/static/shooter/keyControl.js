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

export class PlayerData {
    constructor() {
        this.move = {
            up: false,
            down: false,
            left: false,
            right: false,
        }
    }
}

export class KeyControls {
    constructor (player, props = {}) {
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
        this.socket = null;
        this.data = null;
        this.connection = null;

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

    sendToSocket(move, position) {
        let data = {};
        data.move = move;
        data.position = position ? position : undefined;
        
        this.send(JSON.stringify(data));
    }

    keydownListener() {
        window.addEventListener('mousedown', (e) => {
            if (!this.Lclick.hold)
                this.Lclick.pressVal = true;
            this.Lclick.hold = true;
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
                    if (!this.Jkey.hold)
                        this.Jkey.pressVal = true;
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
            });
            window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                    this.sendToSocket({"up": false}, this?.player.position);
                    this.Wkey.releaseVal = true;
                    this.Wkey.hold = false;
                    break;
                case 'KeyA':
                    this.sendToSocket({"left": false}, this?.player.position);
                    this.Akey.releaseVal = true;
                    this.Akey.hold = false;
                    break;
                case 'KeyS':
                    this.sendToSocket({"down": false}, this?.player.position);
                    this.Skey.releaseVal = true;
                    this.Skey.hold = false;
                    break;
                case 'KeyD':
                    this.sendToSocket({"right": false}, this?.player.position);
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
