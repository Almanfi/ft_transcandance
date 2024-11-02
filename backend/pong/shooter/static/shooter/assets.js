import * as THREE from 'three';
import { KeyControls } from './keyControl.js';

function applyPlaneRotation(vect, angle) {
	let cosA = Math.cos(angle);
	let sinA = Math.sin(angle);
	vect.applyMatrix3(new THREE.Matrix3(cosA, 0, sinA, 0, 1, 0, - sinA, 0, cosA));
}

export class Turret extends THREE.Mesh {
    constructor(props = {}) {
		let radius = props.radius || 3;
		let color = props.color || 0x000000;
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhysicalMaterial({ color });
        super(geometry, material);

        Object.assign(this, {
            radius,
            color,
            initPosition: { x: 0, y: 0, z: 0 },
            speed: 0.5,
            rotationSpeed: 0.02,
            fireAngle: 0,
        }, props);

        this.scene = null;

		this.position.set(this.initPosition.x, this.initPosition.y, this.initPosition.z);

		// this.box = new THREE.Box3();
		// this.mesh.geometry.computeBoundingBox();
		// this.box.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
		// this.boxHelper = new THREE.BoxHelper( this.mesh, 0xffff00 );
		// this.boxHelper.visible = false;
	};

    addBulletManager(bulletManager) {
        this.bulletManager = bulletManager;
    }
	
	fire(color) {
		let ballSpeed = this.speed;
        // let ballSpeed = 0.5;
		let vect0 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect0, this.fireAngle + 2 * Math.PI);
        this.bulletManager.spawnBullet(color, this.position, vect0);

		let vect1 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect1, this.fireAngle + Math.PI / 2);
        this.bulletManager.spawnBullet(color, this.position, vect1);

		let vect2 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect2, this.fireAngle + Math.PI);
        this.bulletManager.spawnBullet(color, this.position, vect2);

		let vect3 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect3, this.fireAngle + 3 * Math.PI / 2);
        this.bulletManager.spawnBullet(color, this.position, vect3);
	};

	update(timeS) {
		// this.fireAngle += this.rotationSpeed;
        let ballSpeed = 0.3;
        this.fireAngle += timeS / ballSpeed;
	};

	addToScene(scene) {
        this.scene = scene;
		scene.add(this);
	}

}

export class TurretBullet extends THREE.Mesh {
    constructor() {
        const geometry = new THREE.SphereGeometry(1.5);
        const material = new THREE.MeshBasicMaterial();
        super(geometry, material);
    }

    // constructor(position, speed, color, scene) {
    //     let radius = 1.5;
    //     if (color === undefined)
    //         color = 0xfc7703;
    //     const geometry = new THREE.SphereGeometry(radius);
    //     const material = new THREE.MeshBasicMaterial( {color, side: THREE.DoubleSide} );
    //     super(geometry, material);
    //     this.speed = speed;
    //     this.date = new Date().valueOf();
    //     this.position.set(position.x, position.y, position.z);
    //     scene.add(this);
    // };

    set(color, position, speed) {
        this.date = new Date().valueOf();
        this.speed = speed;
        this.position.set(position.x, position.y, position.z);
        this.material.color.set(color);
    }

    update() {
		this.position.addScaledVector(this.speed, 1);
    }
}

export class Bullet extends THREE.Mesh {
    constructor() {
        const geometry = new THREE.CapsuleGeometry( 1, 2, 2, 4);
        const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 1, roughness: 0.17, emissive: 0xeeeeee, emissiveIntensity: 1} );
        super(geometry, material);
    }

    // constructor(position, speed, angle, scene) {
    //     let width = 1.5;
    //     let length = 4;
    //     // if (color === undefined)
    //     let color = 0xffffff;
    //     const geometry = new THREE.CapsuleGeometry( 1, 2, 2, 4);
    //     // const material = new THREE.MeshPhongMaterial({ color: 0x000000});
    //     const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 1, roughness: 0.17, emissive: 0xeeeeee, emissiveIntensity: 1} );
    //     super(geometry, material);
    //     this.speed = speed;
    //     this.date = new Date().valueOf();
    //     this.position.set(position.x, position.y, position.z);
    //     this.position.addScaledVector(this.speed, 2);
    //     this.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), angle);
    //     this.rotateX(Math.PI / 2);
    //     scene.add(this);
    // };

    set(position, speed, angle) {
        this.date = new Date().valueOf();
        this.speed = speed;
        this.material.color.set(0xffffff);
        this.material.emissive.set(0xeeeeee);
        this.position.set(position.x, position.y, position.z);
        this.position.addScaledVector(this.speed, 2);
        this.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), angle);
        this.rotateX(Math.PI / 2);
    }

    update() {
        this.position.addScaledVector(this.speed, 2);
    }
}

// const spaceShip = new THREE.Object3D();

function createCore() {
    let scale = 1;
    const geometry = new THREE.CapsuleGeometry( scale, 1, 4, 6 )
    // const geometry = new THREE.BoxGeometry( scale, scale, scale );
    // const geometry = new THREE.LatheGeometry( 
    //     [ new THREE.Vector2(0, -0.3), new THREE.Vector2(0.4, 0), new THREE.Vector2(0, 0.3), new THREE.Vector2(1, 0) ], 8
    // );
    const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 0.3, emissive: 0x777777, emissiveIntensity: 0.8} );
    const core = new THREE.Mesh( geometry, material );
    // core.scale.set(scale, scale, scale);
    core.name = 'core';
    core.position.y = 0;
    core.position.z = 0;
    core.position.x = 0;
    return core;
}

function createCannon() {
    const cannon = new THREE.Object3D();
    const invisibleCore = createCore();
    invisibleCore.visible = false;
    const geometry = new THREE.CylinderGeometry( 0, 0.7, 1.5, 6 );
    const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 0.1, emissive: 0xeeeef7, emissiveIntensity: 0.8} );
    const cannonHead = new THREE.Mesh( geometry, material );
    cannonHead.name = 'cannonHead';
    cannonHead.position.y = 0;
    cannonHead.position.z = -2;
    cannonHead.position.x = 0;
    cannonHead.rotateX(- Math.PI / 2);
    cannon.head = cannonHead;
    cannon.add(invisibleCore);
    cannon.add(cannonHead);
    cannon.name = 'cannon';
    return cannon;
}


export class Player extends THREE.Object3D {
    constructor(position) {
        // let width = 3;
        // let color = 0x0096FF;
        // const geometry = new THREE.BoxGeometry(width, width, width);
        // const material = new THREE.MeshBasicMaterial( {color, side: THREE.DoubleSide} );
        // super(geometry, material);
        super();
        var core = createCore();
        var cannon = createCannon();
        this.core = core;
        this.cannon = cannon;
        this.add(core);
        this.add(cannon);
        this.position.set(position.x, position.y, position.z);
        let scale = 2;
        this.scale.set(scale, scale, scale);
        this.fireRate = 0;
        this.controls = null;
    };

    addToScene(scene) {
        this.scene = scene;
		scene.add(this);
	}

    attachControls(controls) {
        this.controls = controls;
    }

    addBulletSound(sound) {
        this.bulletSound = sound;
    }

    addBulletManager(bulletManager) {
        this.bulletManager = bulletManager;
    }

    // findPlayerDirection(keyControls, projectionOnPlane) {
    //     const sideOnPlane = projectionOnPlane.clone().cross(new THREE.Vector3(0, 1, 0));
    //     let speedVect = new THREE.Vector3(0, 0, 0);
    
    //     speedVect.addScaledVector(projectionOnPlane, keyControls.Wkey.hold - keyControls.Skey.hold);
    //     speedVect.addScaledVector(sideOnPlane, keyControls.Dkey.hold - keyControls.Akey.hold);
    //     speedVect.normalize();
    //     return speedVect;
    // }


    update(timeS, planeFacingVector) {
        let speed = 3 * timeS;
        const projectionOnPlane = planeFacingVector.multiplyScalar(speed);

        this.core.rotateY(0.1);
        // this.cannon.head.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.05);
        this.cannon.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), this.controls.angle);
        
        this.position.addScaledVector(this.controls.speedVector(projectionOnPlane), 1);
        if (this.fireRate > 4) {
            this.fireRate = 0;
            this.fire()
        }
        this.fireRate++;
        
    }
    move(timeS, move, planeFacingVector) {
        let speed = 3 * timeS;
        const projectionOnPlane = planeFacingVector.multiplyScalar(speed);
        const sideOnPlane = projectionOnPlane.clone().cross(new THREE.Vector3(0, 1, 0));
    
        let posDiff = new THREE.Vector3(0, 0, 0);

        if (move.up) {
            posDiff.x += projectionOnPlane.x;
            posDiff.z += projectionOnPlane.z;
        }
        if (move.down) {
            posDiff.x += -projectionOnPlane.x;
            posDiff.z += -projectionOnPlane.z;
        }
        if (move.left) {
            posDiff.x += -sideOnPlane.x;
            posDiff.z += -sideOnPlane.z;
        }
        if (move.right) {
            posDiff.x += sideOnPlane.x;
            posDiff.z += sideOnPlane.z;
        }
        posDiff.normalize();
        this.position.x += posDiff.x;
        this.position.z += posDiff.z;
    }

    // createBullet(angle, direction) {
    //     let ballSpeed = 2;
    //     let vect0 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
    //     applyPlaneRotation(vect0, angle + Math.PI / 2);
    //     return new Bullet(this.position, vect0, angle, this.scene);
    // }
    
    fire() {
        if (this.controls.fire()) {
            if (this.cannon.head.position.z > -2.4)
                this.cannon.head.position.z -= 0.1;
            this.bulletManager.spawnBullet(this.position, this.controls.direction.clone(), this.controls.angle);
            // let bullet = this.createBullet(this.controls.angle, this.controls.direction);
            // bullets.set(bullet.id, bullet);
            // bulletIndex++;
            // Pbullets.set(bulletIndex, createBullet(spaceShip.position, direction, angle));
            this.bulletSound.stop();
            this.bulletSound.setDetune((0.5 - Math.random()) * 50)
            this.bulletSound.play();
            // bulletSound.stop();
            // bulletSound.setDetune((0.5 - Math.random()) * 50)
            // bulletSound.play(); 
        }
        else {
            if (this.cannon.head.position.z < -2)
                this.cannon.head.position.z += 0.2;
        }
    }
}

export class PlayersBulletManager {
    constructor(scene) {
        this.bullets = new Map();
        this.bulletsPool = new Map();
        this.scene = scene;
        this.createBulletsPool(120);
    }

    createBulletsPool(poolSize) {
        console.log('createBulletsPool of size: ', poolSize, "now pool has : ", this.bulletsPool.size, "and used bullets are : ", this.bullets.size);
        for (let i = 0; i < poolSize; i++) {
            let bullet = new Bullet();
            bullet.visible = false;
            this.scene.add(bullet);
            this.bulletsPool.set(bullet.id, bullet);
        }
    }

    spawnBullet(color, position, speed, angle) {
        let bullet = this.getBullet();
        bullet.set(color, position, speed, angle);
        bullet.visible = true;
    }

    despawnBullet(bullet) {
        bullet.visible = false;
        this.returnBullet(bullet);
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

    update() {
        let dateNow = new Date().valueOf();
        this.bullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.despawnBullet(elem);
            }
            else
                elem.update();
        })
    }

    checkCollision(other) {
        var vex = new THREE.Vector3();
        var threshold = 4;
        for(var [key, bullet] of this.bullets) {
            vex.subVectors(other.position, bullet.position);
            if (vex.length() < threshold) {
                bullet.material.color.set(0x000000);
                bullet.material.emissive.set(0x000000);
                // this.bullets.get(key).material.color.set(0x000000);
                return;
            }
            for(let [Pkey, otherBullet] of other.bulletManager.bullets) {
                vex.subVectors(otherBullet.position, bullet.position);
                if (vex.length() < threshold) {
                    this.despawnBullet(bullet);
                    other.bulletManager.despawnBullet(otherBullet);
                    break;
                }
            }
        }
    }
}

export class TurretBulletManager {
    constructor(scene) {
        this.bullets = new Map();
        this.bulletsPool = new Map();
        this.scene = scene;
        this.createBulletsPool(500);
    }

    createBulletsPool(poolSize) {
        for (let i = 0; i < poolSize; i++) {
            let bullet = new TurretBullet();
            bullet.visible = false;
            this.scene.add(bullet);
            this.bulletsPool.set(bullet.id, bullet);
        }
    }

    spawnBullet(color, position, speed) {
        let bullet = this.getBullet();
        bullet.set(color, position, speed);
        bullet.visible = true;
    }

    despawnBullet(bullet) {
        bullet.visible = false;
        this.returnBullet(bullet);
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

    update() {
        let dateNow = new Date().valueOf();
        this.bullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.despawnBullet(elem);
            }
            else
                elem.update();
        })
    }

    checkCollision(player) {
        var vex = new THREE.Vector3();
        var threshold = 2;
        for(var [key, bullet] of this.bullets) {
            vex.subVectors(player.position, bullet.position);
            if (vex.length() < threshold) {
                this.bullets.get(key).material.color.set(0x000000);
                return;
            }
            if (this.bullets.get(key).material.color.getHex() === 0xff0000)
                continue;
            for(let [Pkey, PlayerBullet] of player.bulletManager.bullets) {
                vex.subVectors(PlayerBullet.position, bullet.position);
                if (vex.length() < threshold) {
                    this.despawnBullet(bullet);
                    player.bulletManager.despawnBullet(PlayerBullet);
                    break;
                }
            }
        }
    }
}

// export class BulletManager {
//     constructor(scene) {
//         this.turretBullets = new Map();
//         this.playersBullets = new Map();
//         this.turretBulletsPool = new Map();
//         this.playersBulletsPool = new Map();
//         this.scene = scene;
//     }

//     createTurretBulletPool(poolSize) {
//         for (let i = 0; i < poolSize; i++) {
//             let bullet = new TurretBullet(this.scene);
//             bullet.visible = false;
//             this.scene.add(bullet);
//             this.turretBulletsPool.set(bullet.id, bullet);
//         }
//     }

//     createPlayerBulletsPool(poolSize) {
//         for (let i = 0; i < poolSize; i++) {
//             let bullet = new Bullet();
//             bullet.visible = false;
//             this.scene.add(bullet);
//             this.playerBulletsPool.set(bullet.id, bullet);
//         }
//     }


        
// }
