import * as THREE from 'three';


export function initPlane(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry( 400, 300 );
    const material = new THREE.MeshBasicMaterial( {color: 0xcccccd, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.receiveShadow = true;
    plane.position.set(0, -3, 0);
    plane.rotateX(Math.PI / 2);

    return plane;
}

function applyPlaneRotation(vect, angle) {
	let cosA = Math.cos(angle);
	let sinA = Math.sin(angle);
	vect.applyMatrix3(new THREE.Matrix3(cosA, 0, sinA, 0, 1, 0, - sinA, 0, cosA));
}

export class Turret extends THREE.Mesh {
    radius: number;
    color: number;
    initPosition: { x: number, y: number, z: number };
    speed: number;
    rotationSpeed: number;
    fireAngle: number;
    bulletManager: any;
    timeStamp: number;

    constructor(props = {radius: 3, color: 0x000000}) {
        let color = props.color;
        const geometry = new THREE.SphereGeometry(props.radius);
        const material = new THREE.MeshPhysicalMaterial({ color });
        super(geometry, material);

        Object.assign(this, {
            initPosition: { x: 0, y: 0, z: 0 },
            speed: 0.5,
            rotationSpeed: 0.02,
            fireAngle: 0,
        }, props);

		this.position.set(this.initPosition.x, this.initPosition.y, this.initPosition.z);
        this.timeStamp = performance.now();
	};

    addBulletManager(bulletManager) {
        this.bulletManager = bulletManager;
    }
	
	fire(color) {
		let ballSpeed = this.speed;
        let spawnTime = this.timeStamp;
		let vect0 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect0, this.fireAngle + 2 * Math.PI);
        this.bulletManager.spawnBullet(color, this.position, vect0, spawnTime);

		let vect1 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect1, this.fireAngle + Math.PI / 2);
        this.bulletManager.spawnBullet(color, this.position, vect1, spawnTime);

		let vect2 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect2, this.fireAngle + Math.PI);
        this.bulletManager.spawnBullet(color, this.position, vect2, spawnTime);

		let vect3 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect3, this.fireAngle + 3 * Math.PI / 2);
        this.bulletManager.spawnBullet(color, this.position, vect3, spawnTime);
	};

    fireAtAngle(color, angle) {
        this.fireAngle += angle;
        this.fire(color);
        this.fireAngle -= angle;
    }


	update(timeStamp) {
        this.timeStamp = timeStamp;
        let time = timeStamp;
        this.fireAngle = time / 1000;
	};
	addToScene(scene) {
		scene.add(this);
	}
}

type MyGeometry = THREE.SphereGeometry | THREE.CapsuleGeometry;

type MeshInitFn = (geometry: MyGeometry
    , material: THREE.Material, radius: number)
     => { geometry: THREE.SphereGeometry | THREE.CapsuleGeometry, material: THREE.Material, radius: number };

abstract class ABullet extends THREE.Mesh {
    radius: number;
    speedRate: number;
    initPosition: THREE.Vector3;
    date: number;
    speed: THREE.Vector3;

    constructor(geometry: MyGeometry, material: THREE.Material) {
        super(geometry, material);
        // this.oldPosition = new THREE.Vector3();
    }

    setOriginal(position, speed, spawnTime) {
        this.date = spawnTime;
        this.speed = speed;
        this.position.set(position.x, position.y, position.z);
        this.initPosition.copy(position);
    }

    update(time) {
        this.position.copy(this.initPosition)
        .addScaledVector(this.speed, this.speedRate * ((time - this.date) / 1000));
    }

    getCurrentPosition(radius) {
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(this.speed, radius);
        return point;
    }

    getOldPosition(radius, s) {
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(this.speed, - radius - this.speedRate * s);
        return point;
    }

    lastPosition(s) {
        // return this.oldPosition;
        let lastPosition = new THREE.Vector3();
        lastPosition.copy(this.position);
        lastPosition.addScaledVector(this.speed, - this.speedRate * s);
        return lastPosition;
    }
}


export class TurretBullet extends ABullet {
    constructor() {
        let radius = 1.5;
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshBasicMaterial();
        super(geometry, material);
        this.radius = radius;
        this.speedRate = 50;
        this.initPosition = new THREE.Vector3();
    }

    set(color, position, speed, spawnTime) {
        this.setOriginal(position, speed, spawnTime);
        this.material.color.set(color);
    }

    isSlowerThan(other) {
         return this.speedRate < other.speedRate;
    }

    intersects(other, s, vex) {
        s = s / 1000;
        let radius = this.radius + other.radius;
        vex.subVectors(this.position, other.position);
        let distance = vex.length();
        if (distance < radius)
            return true;

        if (distance > 20) // filter far objects
            return false;

        let isSlow = this.isSlowerThan(other);

        let fastest = isSlow ? other : this;
        let slowest = isSlow ? this : other;

        if (slowest.lastPosition(s).distanceTo(slowest.position) < 0.001) {
            return lineIntersectsCircle(fastest.lastPosition(s), fastest.position, slowest.position, radius);
        }

        let thisStart = this.getOldPosition(radius, s);
        let thisEnd = this.getCurrentPosition(radius);
        let otherStart = other.getOldPosition(radius, s);
        let otherEnd = other.getCurrentPosition(radius);
        if (doIntersect(thisStart, thisEnd, otherStart, otherEnd)) {
            // console.log(`doIntersect(${JSON.stringify(thisStart)}, ${JSON.stringify(thisEnd)}, ${JSON.stringify(otherStart)}, ${JSON.stringify(otherEnd)})`);
            return true;
        }
        return false;
    }
}


export class PlayerBullet extends ABullet {
    constructor() {
        let radius = 1;
        const geometry = new THREE.CapsuleGeometry( radius, 2, 2, 4);
        const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 1, roughness: 0.17, emissive: 0xeeeeee, emissiveIntensity: 1} );
        super(geometry, material);
        this.radius = radius;
        this.speedRate = 100;
        this.initPosition = new THREE.Vector3();
    }

    set(color, position, speed, angle, spawnTime) {
        this.setOriginal(position, speed, spawnTime);
        this.material.color.set(color);
        this.material.emissive.set(0xeeeeee);
        this.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), angle);
        this.rotateX(Math.PI / 2);
    }

    getOldPosition(radius, s) {
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(this.speed, - radius - this.speedRate * s);
        return point;
    }

    lastPosition(s) {
        // return this.oldPosition;
        let lastPosition = new THREE.Vector3();
        lastPosition.copy(this.position);
        lastPosition.addScaledVector(this.speed, - this.speedRate * s);
        return lastPosition;
    }

    intersects(other, s, vex) {
        s = s / 1000;
        let radius = this.radius + other.radius;
        vex.subVectors(this.position, other.position);
        let distance = vex.length();
        if (distance < radius)
            return true;
        vex.subVectors(this.lastPosition(s), other.lastPosition(s));
        distance = vex.length();
        if (distance < radius)
            return true;
        if (distance > 20)
            return false;
        let thisStart = this.lastPosition(s);
        let thisEnd = this.position;
        let otherStart = other.lastPosition(s);
        let otherEnd = other.position;
    
        if (thisStart.distanceTo(thisEnd) < 0.001) {
            return lineIntersectsCircle(otherStart, otherEnd, thisEnd, radius);
        } else if (otherStart.distanceTo(otherEnd) < 0.001) {
            return lineIntersectsCircle(thisStart, thisEnd, otherEnd, radius);
        }
        if (lineIntersectsCircle(thisStart, thisEnd, otherStart, radius)) {
            console.log('lineIntersectsCircle(thisStart, thisEnd, otherStart, radius)');
            return true;
        }
        if (lineIntersectsCircle(thisStart, thisEnd, otherEnd, radius)) {
            console.log('lineIntersectsCircle(thisStart, thisEnd, otherEnd, radius)');
            return true;
        }
        if (doIntersect(thisStart, thisEnd, otherStart, otherEnd)) {
            console.log('doIntersect(thisStart, thisEnd, otherStart, otherEnd)');
            return true;
        }
        return false;
    }
}

function doIntersect(p1, q1, p2, q2) {
    function orientation(p, q, r) {
        let val = (q.z - p.z) * (r.x - q.x) - (q.x - p.x) * (r.z - q.z);
        if (val === 0) return 0;
        return (val > 0) ? 1 : 2;
    }

    function onSegment(p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
               q.z <= Math.max(p.z, r.z) && q.z >= Math.min(p.z, r.z);
    }


    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;
    

    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
}

function lineIntersectsCircle(lineStart, lineEnd, circleCenter, radius) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.z - lineStart.z;
    const fx = lineStart.x - circleCenter.x;
    const fy = lineStart.z - circleCenter.z;

    const A = dx * dx + dy * dy;
    const B = 2 * (fx * dx + fy * dy);
    const C = (fx * fx + fy * fy) - radius * radius;

    const discriminant = B * B - 4 * A * C;

    if (discriminant < 0) {
        // No intersection
        return false;
    } else {
        // Check if the intersection points are within the segment
        const t1 = (-B - Math.sqrt(discriminant)) / (2 * A);
        const t2 = (-B + Math.sqrt(discriminant)) / (2 * A);

        // Check if either t1 or t2 is within the range [0, 1]
        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
            return true;
        } else {
            return false;
        }
    }
}

class ABulletManager {
    scene: THREE.Scene;
    bullets: Map<number, any>;
    bulletsPool: Map<number, any>;
    destroyedBullets: Map<number, any>;
    startTime: number;

    constructor(scene) {
        this.scene = scene;
        this.bullets = new Map();
        this.bulletsPool = new Map();
        this.destroyedBullets = new Map();
    }

    reset(startTime) {
        this.startTime = startTime;
        this.bullets.forEach((elem) => {
            this.despawnBullet(elem);
        })
        this.destroyedBullets.forEach((elem) => {
            this.returnDestroyedBullet(elem);
        })
    }

    createBullet(): PlayerBullet {
        return new PlayerBullet();
    }

    createBulletsPool(poolSize) {
        console.log('createBulletsPool of size: ', poolSize, "now pool has : ", this.bulletsPool.size, "and used bullets are : ", this.bullets.size);
        for (let i = 0; i < poolSize; i++) {
            let bullet = this.createBullet();
            bullet.visible = false;
            this.scene.add(bullet);
            this.bulletsPool.set(bullet.id, bullet);
        }
    }

    despawnBullet(bullet) {
        bullet.visible = false;
        this.returnBullet(bullet);
    }

    destroyBullet(bullet) {
        bullet.visible = false;
        bullet.destructionTime = performance.now();
        this.destroyedBullets.set(bullet.id, bullet);
        this.bullets.delete(bullet.id);
    }

    undestroyBullet(bullet) {
        bullet.visible = true;
        this.bullets.set(bullet.id, bullet);
        this.destroyedBullets.delete(bullet.id);
    }

    getBullet() {
        if (this.bulletsPool.size < 1) {
            this.createBulletsPool(10);
            return this.getBullet();
        }
        let bullet = this.bulletsPool.values().next().value;
        this.bulletsPool.delete(bullet.id);
        this.bullets.set(bullet.id, bullet);
        return bullet;
    }


    returnBullet(bullet) {
        this.bulletsPool.set(bullet.id, bullet);
        this.bullets.delete(bullet.id);
    }

    returnDestroyedBullet(bullet) {
        this.bulletsPool.set(bullet.id, bullet);
        this.destroyedBullets.delete(bullet.id);
    }

    update(timeNow) {
        let dateNow = timeNow;
        this.bullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.despawnBullet(elem);
            }
            else
                elem.update(dateNow);
        })
        this.destroyedBullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.returnDestroyedBullet(elem);
            }
        })
    }

    findPositionAtTime(time) {
        this.bullets.forEach((elem) => {
            if (time > elem.date)
                elem.update(time);
        })
        this.destroyedBullets.forEach((elem) => {
            if (time > elem.date)
                elem.update(time);
        })
    }

}



export class PlayersBulletManager extends ABulletManager {
    constructor(scene) {
        super (scene);
        this.createBulletsPool(120);
    }

    createBullet(): PlayerBullet {
        return new PlayerBullet();
    }

    spawnBullet(color, position, speed, angle, spawnTime) {
        let bullet = this.getBullet();
        bullet.set(color, position, speed, angle, spawnTime);
        bullet.visible = true;
    }



    batchUndestroyBullet() {//this create problems
        // this.destroyedBullets.forEach((elem) => {
        //     this.undestroyBullet(elem);
        // })
    }

    checkRollbackCollision(other, s, time) {
        var vex = new THREE.Vector3();
        //normal bullets check
        for(var [key, bullet] of this.bullets) {
            if (bullet.date > time)
                continue;
            if (bullet.intersects(other, s, vex)) {
                bullet.material.color.set(0x00ff00);
                bullet.material.emissive.set(0x000000);
                return;
            }
            for(let [Pkey, otherBullet] of other.bulletManager.bullets) {
                if (otherBullet.date > time)
                    continue;
                if (bullet.intersects(otherBullet, s, vex)) {
                    this.despawnBullet(bullet);
                    other.bulletManager.despawnBullet(otherBullet);
                    break;
                }
            }
            for(let [Pkey, otherBullet] of other.bulletManager.destroyedBullets) {
                if (otherBullet.date > time)
                    continue;
                if (bullet.intersects(otherBullet, s, vex)) {
                    this.despawnBullet(bullet);
                    other.bulletManager.returnDestroyedBullet(otherBullet);
                    break;
                }
            }
        }
        //destroyed bullets check
        for(var [key, bullet] of this.destroyedBullets) {
            if (bullet.date > time)
                continue;
            if (bullet.intersects(other, s, vex)) {
                this.undestroyBullet(bullet);
                bullet.material.color.set(0x00ff00);
                bullet.material.emissive.set(0x000000);
                return;
            }
            for(let [Pkey, otherBullet] of other.bulletManager.bullets) {
                if (otherBullet.date > time)
                    continue;
                if (bullet.intersects(otherBullet, s, vex)) {
                    this.returnDestroyedBullet(bullet);
                    other.bulletManager.despawnBullet(otherBullet);
                    break;
                }
            }
            for(let [Pkey, otherBullet] of other.bulletManager.destroyedBullets) {
                if (otherBullet.date > time)
                    continue;
                if (bullet.intersects(otherBullet, s, vex)) {
                    this.returnDestroyedBullet(bullet);
                    other.bulletManager.returnDestroyedBullet(otherBullet);
                    break;
                }
            }
        }
    }

    checkCollision(other, s) {
        let vex = new THREE.Vector3();
        for(var [key, bullet] of this.bullets) {
            if (bullet.intersects(other, s, vex)) {
                bullet.material.color.set(0x000000);
                bullet.material.emissive.set(0x000000);
                return;
            }
            for(let [Pkey, otherBullet] of other.bulletManager.bullets) {
                if (bullet.intersects(otherBullet, s, vex)) {
                    this.despawnBullet(bullet);
                    other.bulletManager.despawnBullet(otherBullet);
                    break;
                }
            }
        }
    }

}

export class TurretBulletManager extends ABulletManager {
    constructor(scene) {
        super(scene);
        this.createBulletsPool(500);
    }

    createBullet(): TurretBullet {
        return new TurretBullet();
    }

    spawnBullet(color, position, speed, spawnTime) {
        let bullet = this.getBullet();
        bullet.set(color, position, speed, spawnTime);
        bullet.visible = true;
    }

    batchUndestroyBullet() {
        this.destroyedBullets.forEach((elem) => {
            this.undestroyBullet(elem);
        })
    }


    checkRollbackCollision(player, s, time) {
        var vex = new THREE.Vector3();
        //normal bullets check
        for(var [key, bullet] of this.bullets) {
            if (bullet.date > time)
                continue;
            if (bullet.intersects(player, s, vex)) {
                bullet.material.color.set(0x00ff00);
                return;
            }
            if (bullet.material.color.getHex() === 0xff0000)
                continue;
            for(let [Pkey, PlayerBullet] of player.bulletManager.bullets) {
                if (PlayerBullet.date > time)
                    continue;
                if (bullet.intersects(PlayerBullet, s, vex)) {
                    this.despawnBullet(bullet);
                    player.bulletManager.despawnBullet(PlayerBullet);
                    break;
                }
            }
            for(let [Pkey, PlayerBullet] of player.bulletManager.destroyedBullets) {
                if (PlayerBullet.date > time)
                    continue;
                if (bullet.intersects(PlayerBullet, s, vex)) {
                    this.despawnBullet(bullet);
                    player.bulletManager.returnDestroyedBullet(PlayerBullet);
                    break;
                }
            }
        }
        //destroyed bullets check
        for(var [key, bullet] of this.destroyedBullets) {
            if (bullet.date > time)
                continue;
            if (bullet.intersects(player, s, vex)) {
                this.undestroyBullet(bullet);
                bullet.material.color.set(0x00ff00);
                return;
            }
            // no destroyed bullet is red
            // if (this.bullets.get(key).material.color.getHex() === 0xff0000)
            //     continue;
            for(let [Pkey, PlayerBullet] of player.bulletManager.bullets) {
                if (PlayerBullet.date > time)
                    continue;
                if (bullet.intersects(PlayerBullet, s, vex)) {
                    this.returnDestroyedBullet(bullet);
                    player.bulletManager.despawnBullet(PlayerBullet);
                    break;
                }
            }
            for(let [Pkey, PlayerBullet] of player.bulletManager.destroyedBullets) {
                if (PlayerBullet.date > time)
                    continue;
                if (bullet.intersects(PlayerBullet, s, vex)) {
                    this.returnDestroyedBullet(bullet);
                    player.bulletManager.returnDestroyedBullet(PlayerBullet);
                    break;
                }
            }
        }
    }

    checkCollision(player, s) {
        var vex = new THREE.Vector3();
        for(var [key, bullet] of this.bullets) {
            if (bullet.intersects(player, s, vex)) {
                this.bullets.get(key).material.color.set(0x000000);
                return;
            }
            if (this.bullets.get(key).material.color.getHex() === 0xff0000)
                continue;
            for(let [Pkey, PlayerBullet] of player.bulletManager.bullets) {
                if (bullet.intersects(PlayerBullet, s, vex)) {
                    this.destroyBullet(bullet);
                    player.bulletManager.destroyBullet(PlayerBullet);
                    break;
                }
            }
        }
    }
}

