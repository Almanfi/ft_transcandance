
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

export class KeyControls {
    #foo = 10;
    constructor (props = {}) {
        Object.assign(this, {
            Wkey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Akey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Skey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Dkey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            shift: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Jkey: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
            Lclick: {press: null, pressVal: false, hold: false, release: null, releaseVal: false },
        }, props);

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

        // console.log("foo is actualy here and it s : ", this.#foo);
        this.keydownListener();
        this.keyupListener();
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
                    if (!this.Wkey.hold)
                        this.Wkey.pressVal = true;
                    this.Wkey.hold = true;
                    break;
                case 'KeyA':
                    if (!this.Akey.hold)
                        this.Akey.pressVal = true;
                    this.Akey.hold = true;
                    break;
                case 'KeyS':
                    if (!this.Skey.hold)
                        this.Skey.pressVal = true;
                    this.Skey.hold = true;
                    break;
                case 'KeyD':
                    if (!this.Dkey.hold)
                        this.Dkey.pressVal = true;
                    this.Dkey.hold = true;
                    break;
                case 'ShiftLeft':
                    if (!this.shift.hold)
                        this.shift.pressVal = true;
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