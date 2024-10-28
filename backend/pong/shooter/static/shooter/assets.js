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
	
	fire(color, bullets) {
		let ballSpeed = this.speed;
        // let ballSpeed = 0.5;
		let vect0 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect0, this.fireAngle + 2 * Math.PI);
        var bullet0 = new TurretBullet(this.position, vect0, color, this.scene);
		bullets.set(bullet0.id, bullet0);

		let vect1 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect1, this.fireAngle + Math.PI / 2);
        var bullet1 = new TurretBullet(this.position, vect1, color, this.scene)
		bullets.set(bullet1.id, bullet1);

		let vect2 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect2, this.fireAngle + Math.PI);
        var bullet2 = new TurretBullet(this.position, vect2, color, this.scene);
		bullets.set(bullet2.id, bullet2);

		let vect3 = new THREE.Vector3(1,0,0).multiplyScalar(ballSpeed);
		applyPlaneRotation(vect3, this.fireAngle + 3 * Math.PI / 2);
        var bullet3 = new TurretBullet(this.position, vect3, color, this.scene);
		bullets.set(bullet3.id, bullet3);
	};

	update() {
		// this.fireAngle += this.rotationSpeed;
        let ballSpeed = 0.3;
        this.fireAngle += 0.02 / ballSpeed;
	};

	addToScene(scene) {
        this.scene = scene;
		scene.add(this);
	}

}

export class TurretBullet extends THREE.Mesh {
    constructor(position, speed, color, scene) {
        let radius = 1.5;
        if (color === undefined)
            color = 0xfc7703;
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshBasicMaterial( {color, side: THREE.DoubleSide} );
        super(geometry, material);
        this.speed = speed;
        this.date = new Date().valueOf();
        this.position.set(position.x, position.y, position.z);
        scene.add(this);
    };

    update() {
		this.position.addScaledVector(this.speed, 1);
    }
}

export class Player extends THREE.Mesh {
    constructor(position) {
        let width = 3;
        let color = 0x0096FF;
        const geometry = new THREE.BoxGeometry(width, width, width);
        const material = new THREE.MeshBasicMaterial( {color, side: THREE.DoubleSide} );
        super(geometry, material);
        this.position.set(position.x, position.y, position.z);
    };

    addToScene(scene) {
        this.scene = scene;
		scene.add(this);
	}

    update(timeS, keyControls, planeFacingVector) {
        let speed = 3 * timeS;
        const projectionOnPlane = planeFacingVector.multiplyScalar(speed);
        const sideOnPlane = projectionOnPlane.clone().cross(new THREE.Vector3(0, 1, 0));
        this.rotateY(0.1);

        let posDiff = new THREE.Vector3(0, 0, 0);
    
        if (keyControls.Wkey.hold) {
            posDiff.x += projectionOnPlane.x;
            posDiff.z += projectionOnPlane.z;
        }
        if (keyControls.Skey.hold) {
            posDiff.x += -projectionOnPlane.x;
            posDiff.z += -projectionOnPlane.z;
        }
        if (keyControls.Akey.hold) {
            posDiff.x += -sideOnPlane.x;
            posDiff.z += -sideOnPlane.z;
        }
        if (keyControls.Dkey.hold) {
            posDiff.x += sideOnPlane.x;
            posDiff.z += sideOnPlane.z;
        }
        posDiff.normalize();
        this.position.x += posDiff.x;
        this.position.z += posDiff.z;
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
}
