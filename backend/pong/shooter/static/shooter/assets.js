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
        let spawnTime = performance.now();
        // let ballSpeed = 0.5;
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
        let radius = 1.5;
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshBasicMaterial();
        super(geometry, material);
        this.initPosition = new THREE.Vector3();
        this.speedRate = 50;
        this.radius = radius;
        this.movementVector = new THREE.Vector3();
        // this.oldPosition = new THREE.Vector3();
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

    set(color, position, speed, spawnTime) {
        this.date = spawnTime
        this.speed = speed;
        this.position.set(position.x, position.y, position.z);
        this.material.color.set(color);
        this.initPosition.copy(position);
    }

    update(time) {
        // this.oldPosition.copy(this.position);
        // this.movementVector.copy(this.speed).multiplyScalar(this.speedRate * s);
		// this.position.addScaledVector(this.movementVector, 1);
        this.position.copy(this.initPosition).addScaledVector(this.speed, this.speedRate * ((time - this.date) / 1000));
		// this.position.addScaledVector(this.speed, this.speedRate * s);
    }


    getCurrentPosition(radius) {
        let vect = new THREE.Vector3();
        vect.copy(this.speed).normalize();
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(vect, radius);
        return point;
    }

    getOldPosition(radius, s) {
        let vect = new THREE.Vector3();
        vect.copy(this.speed).normalize();
        let point = new THREE.Vector3();
        point.copy(this.lastPosition(s));
        point.addScaledVector(vect, - radius);
        return point;
    }


    lastPosition(s) {
        // return this.oldPosition;
        let lastPosition = new THREE.Vector3();
        lastPosition.copy(this.position);
        lastPosition.addScaledVector(this.speed, - this.speedRate * s);
        return lastPosition;
    }

//     intersects(other, s, vex) {
//         let radius = this.radius + other.radius;
//         vex.subVectors(this.position, other.position);
//         let distance = vex.length();
//         if (distance < radius)
//             return true;
//         vex.subVectors(this.lastPosition(s), other.lastPosition(s));
//         distance = vex.length();
//         if (distance < radius)
//             return true;
//         if (distance > 20)
//             return false;
//         console.log("distance of the bullet is ", this.lastPosition(s).distanceTo(this.position))
//         if (this.lastPosition(s).distanceTo(this.position) < 0.001) {
//             return lineIntersectsCircle(other.lastPosition(s), other.position, this.position, radius);
//         }
//         else if (other.lastPosition(s).distanceTo(other.position) < 0.001) {
//             return false;//wrong
//         }
//         // return lineIntersectsCircle(other.lastPosition(s), other.position, this.position, radius);
//         return doIntersect(this.getOldPosition(radius, s), this.getCurrentPosition(radius), other.getOldPosition(radius, s), other.getCurrentPosition(radius));
//         if (doIntersect(this.getOldPosition(radius, s), this.getCurrentPosition(radius), other.getOldPosition(radius, s), other.getCurrentPosition(radius)))
//             return true;
//         if (doIntersect(other.getOldPosition(radius, s), other.getCurrentPosition(radius), this.getOldPosition(radius, s), this.getCurrentPosition(radius)))
//             return true;
//         return false;
//     }

    isSlowerThan(other) {
         return this.speedRate < other.speedRate;
    }


    intersects(other, s, vex) {
        let radius = this.radius + other.radius;
        vex.subVectors(this.position, other.position);
        let distance = vex.length();
        if (distance < radius)
            return true;
        // vex.subVectors(this.lastPosition(s), other.lastPosition(s));
        // distance = vex.length();
        // if (distance < radius)
        //     return true;

        if (distance > 20) // filter far objects
            return false;

        let isSlow = this.isSlowerThan(other);

        let fastest = isSlow ? other : this;
        let slowest = isSlow ? this : other;

        if (slowest.lastPosition(s).distanceTo(slowest.position) < 0.001) {
            return lineIntersectsCircle(fastest.lastPosition(s), fastest.position, slowest.position, radius);
        }
        // if (thisStart.distanceTo(thisEnd) < 0.001) {
        //     return lineIntersectsCircle(otherStart, otherEnd, thisEnd, radius);
        // } else if (otherStart.distanceTo(otherEnd) < 0.001) {
        //     return lineIntersectsCircle(thisStart, thisEnd, otherEnd, radius);
        // }

        // if (lineIntersectsCircle(thisStart, thisEnd, otherStart, radius)) {
        //     console.log('lineIntersectsCircle(thisStart, thisEnd, otherStart, radius)');
        //     return true;
        // }
        // if (lineIntersectsCircle(thisStart, thisEnd, otherEnd, radius)) {
        //     console.log('lineIntersectsCircle(thisStart, thisEnd, otherEnd, radius)');
        //     return true;
        // }

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


export class Bullet extends THREE.Mesh {
    constructor() {
        let radius = 1;
        const geometry = new THREE.CapsuleGeometry( radius, 2, 2, 4);
        const material = new THREE.MeshStandardMaterial( {color: 0xffffff, metalness: 1, roughness: 0.17, emissive: 0xeeeeee, emissiveIntensity: 1} );
        super(geometry, material);
        this.speedRate = 100;
        this.radius = radius;
        // this.oldPosition = new THREE.Vector3();
        this.mouvementVector = new THREE.Vector3();
        this.initPosition = new THREE.Vector3();
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

    set(color, position, speed, angle, spawnTime) {
        this.date = spawnTime;
        this.speed = speed;
        this.material.color.set(color);
        this.material.emissive.set(0xeeeeee);
        this.position.set(position.x, position.y, position.z);
        this.initPosition.copy(position);
        this.position.addScaledVector(this.speed, 2);
        this.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), angle);
        this.rotateX(Math.PI / 2);
    }

    update(s) {
        // this.oldPosition.copy(this.position);
        // this.movementVector.copy(this.speed).multiplyScalar(this.speedRate * s);
		// this.position.addScaledVector(this.movementVector, 1);
        this.position.copy(this.initPosition).addScaledVector(this.speed, this.speedRate * ((performance.now() - this.date) / 1000));
        // this.position.addScaledVector(this.speed, this.speedRate * s);
    }

    getCurrentPosition(radius) {
        let vect = new THREE.Vector3();
        vect.copy(this.speed).normalize();
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(vect, radius);
        return point;
    }

    getOldPosition(radius, s) {
        let vect = new THREE.Vector3();
        vect.copy(this.speed).normalize();
        let point = new THREE.Vector3();
        point.copy(this.lastPosition(s));
        point.addScaledVector(vect, - radius);
        return point;
    }

    lastPosition(s) {
        // return this.oldPosition;
        let lastPosition = new THREE.Vector3();
        lastPosition.copy(this.position);
        lastPosition.addScaledVector(this.speed, - this.speedRate * s);
        return lastPosition;
    }

    // intersects(other, s, vex) {
    //     let radius = this.radius + other.radius;
    //     vex.subVectors(this.position, other.position);
    //     let distance = vex.length();
    //     if (distance < radius)
    //         return true;
    //     vex.subVectors(this.lastPosition(s), other.lastPosition(s));
    //     distance = vex.length();
    //     if (distance < radius)
    //         return true;
    //     if (distance > 20)
    //         return false;
    //     if (this.lastPosition(s).distanceTo(this.position) < 0.001) {
    //         return lineIntersectsCircle(other.lastPosition(s), other.position, this.position, radius);
    //     }
    //     else if (other.lastPosition(s).distanceTo(other.position) < 0.001) {
    //         return false;
    //     }
    //     if (doIntersect(this.lastPosition(s), this.position, other.lastPosition(s), other.position))
    //         return true;
    //     if (doIntersect(other.lastPosition(s), other.position, this.lastPosition(s), this.position))
    //         return true;
    //     return false;
    // }

    intersects(other, s, vex) {
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

function orientation(p, q, r) {
    const val = (q.z - p.z) * (r.x - q.x) - (q.x - p.x) * (r.z - q.z);
    if (val === 0) return 0; // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
}

function findIntersection(p1, q1, p2, q2) {
    // Line 1: p1 to q1
    const a1 = q1.z - p1.z;
    const b1 = p1.x - q1.x;
    const c1 = a1 * p1.x + b1 * p1.z;

    // Line 2: p2 to q2
    const a2 = q2.z - p2.z;
    const b2 = p2.x - q2.x;
    const c2 = a2 * p2.x + b2 * p2.z;

    const determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) {
        // The lines are parallel
        return null;
    } else {
        const x = (b2 * c1 - b1 * c2) / determinant;
        const z = (a1 * c2 - a2 * c1) / determinant;
        return { x, z };
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

// function doIntersect(p1, q1, p2, q2) {
//     console.log("using the do intersect function");
//     let point = findIntersection(p1, q1, p2, q2);
//     if (!point)
//     {
//         console.log('no intersection point');
//         return false;
//     }
//     if (!onSegment(p1, point, q1))
//         return false;
//     console.log('point on segment p1 q1: ', point, p1, q1);
//     if (!onSegment(p2, point, q2))
//         return false;
//     console.log('point on segment p2 q2: ', point, p2, q2);
//     return true;
//     // return onSegment(p1, point, q1);
//     return onSegment(p1, point, q1) && onSegment(p2, point, q2);
//     // console.log('point: ', point);
//     // console.log('p1: ', p1, 'q1: ', q1);
//     // if (point.x < Math.min(p1.x, q1.x) || point.x > Math.max(p1.x, q1.x))
//     //     return false;
//     // if (point.z < Math.min(p1.z, q1.z) || point.z > Math.max(p1.z, q1.z))
//     //     return false;
//     // return true;
//     table = [p1, q1, point];
//     table.sort((a, b) => a.x - b.x);
//     console.log('table: ', table);
//     if (table[1] !== point)
//         return false;
//     table.sort((a, b) => a.z - b.z);
//     console.log('table: ', table);
//     if (table[1] !== point)
//         return false;
//     console.log('intersection point: ', point);
//     return true;
// }


// Function to check if point q lies on segment pr
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.z <= Math.max(p.z, r.z) && q.z >= Math.min(p.z, r.z)) {
        return true;
    }
    return false;
}

// // Function to check if two segments intersect
// function doIntersect2(p1, q1, p2, q2) {
//     // Find the four orientations needed for the general and special cases
//     const o1 = orientation(p1, q1, p2);
//     const o2 = orientation(p1, q1, q2);
//     const o3 = orientation(p2, q2, p1);
//     const o4 = orientation(p2, q2, q1);

//     // General case
//     if (o1 !== o2 && o3 !== o4) {
//         return true;
//     }

//     // Special cases
//     // p1, q1, and p2 are collinear and p2 lies on segment p1q1
//     if (o1 === 0 && onSegment(p1, p2, q1)) return true;

//     // p1, q1, and q2 are collinear and q2 lies on segment p1q1
//     if (o2 === 0 && onSegment(p1, q2, q1)) return true;

//     // p2, q2, and p1 are collinear and p1 lies on segment p2q2
//     if (o3 === 0 && onSegment(p2, p1, q2)) return true;

//     // p2, q2, and q1 are collinear and q1 lies on segment p2q2
//     if (o4 === 0 && onSegment(p2, q1, q2)) return true;

//     // Doesn't fall in any of the above cases
//     console.log('no intersection');
//     return false;
// }

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
        this.radius = 1.5;
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
        this.lastFire = 0;
        this.fired = false;
        this.controls = null;
        this.oldPosition =  this.position.clone();
        this.movementVector = new THREE.Vector3();
        this.actions = new Map();
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
        
        this.oldPosition.copy(this.position);
        this.movementVector.copy(this.controls.speedVector(projectionOnPlane));

        this.position.addScaledVector(this.movementVector, 1);
        if (performance.now() - this.lastFire > 80)
            this.fired = this.fire();
        this.addAction();
    }

    addAction() {
        let time = performance.now();
        let action = {
            startPosition: this.oldPosition,
            movementVector: this.movementVector,
            fire: this.fired,
        }
        this.actions.set(time, action);
    }

    findPositionAtTime(time) {
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

    getCurrentPosition(radius) {
        let vect = new THREE.Vector3();
        vect.copy(this.movementVector).normalize();
        let point = new THREE.Vector3();
        point.copy(this.position);
        point.addScaledVector(this.movementVector, radius);
        return point;
    }

    getOldPosition(radius, s) {
        let vect = new THREE.Vector3();
        vect.copy(this.movementVector).normalize();
        let point = new THREE.Vector3();
        point.copy(this.oldPosition);
        point.addScaledVector(this.movementVector, - radius);
        return point;
    }

    lastPosition(s) {
        return this.oldPosition;
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
            this.lastFire = performance.now();
            let spawnTime = this.lastFire - 50;
            this.bulletManager.spawnBullet(0xffffff, this.position, this.controls.direction.clone(), this.controls.angle, spawnTime);
            this.bulletSound.stop();
            this.bulletSound.setDetune((0.5 - Math.random()) * 50)
            this.bulletSound.play();
            return true;
        }
        if (this.cannon.head.position.z < -2)
            this.cannon.head.position.z += 0.2;
        return false;
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

    spawnBullet(color, position, speed, angle, spawnTime) {
        let bullet = this.getBullet();
        bullet.set(color, position, speed, angle, spawnTime);
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

    update(s) {
        let dateNow = performance.now();
        this.bullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.despawnBullet(elem);
            }
            else
                elem.update(s);
        })
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

export class TurretBulletManager {
    constructor(scene) {
        this.bullets = new Map();
        this.bulletsPool = new Map();
        this.destroyedBullets = new Map();
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

    spawnBullet(color, position, speed, spawnTime) {
        let bullet = this.getBullet();
        bullet.set(color, position, speed, spawnTime);
        bullet.visible = true;
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

    returnDestroyedBullet(bullet) {
        this.bulletsPool.set(bullet.id, bullet);
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

    update(time) {
        let dateNow = performance.now();
        this.bullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.despawnBullet(elem);
            }
            else
                elem.update(performance.now());
        })
        this.destroyedBullets.forEach((elem) => {
            if (dateNow > elem.date + 10 * 1000) {
                this.returnDestroyedBullet(elem);
            }
        })
    }

    findPositionAtTime(time) {
        this.bullets.forEach((elem) => {
                elem.update(time);
        })
        this.destroyedBullets.forEach((elem) => {
            if (time < elem.destructionTime)
                elem.update(time);
        })
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
                    this.despawnBullet(bullet);
                    player.bulletManager.despawnBullet(PlayerBullet);
                    break;
                }
            }
        }
    }
}

