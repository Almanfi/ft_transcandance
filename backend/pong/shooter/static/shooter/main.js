import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { KeyControls, PlayerData, getCameraDir } from './keyControl.js';
import { gameClock } from './gclock.js';
import { Turret, Player, TurretBulletManager, PlayersBulletManager } from './assets.js';
import { MusicSync } from './sound.js';
import { Connection } from './connection.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio * 1);

document.body.appendChild( renderer.domElement );

var playerData = new PlayerData();

var friend = user.id === users[0].id ? users[1] : users[0];


const musicSyncer = new MusicSync(camera);
musicSyncer.loadMusic('/static/shooter/assets/8bit_Weight_World.mp3');
musicSyncer.bullet = musicSyncer.loadNewSound('/static/shooter/assets/a6.mp3');






// scene.add(spaceShip);

// spaceShip.position.y = 10;
// spaceShip.position.z = 0;
// spaceShip.position.x = -60;
// spaceShip.scale.set(4, 4, 4);


const geometry = new THREE.PlaneGeometry( 400, 300 );
const material = new THREE.MeshBasicMaterial( {color: 0xcccccd, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
scene.add( plane );
plane.receiveShadow = true;
plane.position.x = 0;
plane.position.y = 0;
plane.position.z = 0;
plane.rotateX(Math.PI / 2);

const player = new Player({x: 10, y: 0, z: -10});

player.addToScene(scene);
player.addBulletSound(musicSyncer.bullet);

const foe = new Player({x: -10, y: 0, z: 10});

foe.addToScene(scene);
foe.addBulletSound(musicSyncer.bullet);

const keyControls = new KeyControls(player, camera);
const gClock = new gameClock(scene, camera, renderer);


camera.position.x = 20;
camera.position.y = 100;
camera.position.z = -10;
// camera.position.x = 50;
// camera.position.y = 300;
// camera.position.z = -30;

camera.lookAt(0,0,0);

player.add(camera);

var turret = new Turret({initPosition: {x: 10, y: 3, z: 10}, rotationSpeed: 0.1, speed: 1});
turret.addToScene(scene);

var turretBulletManager = new TurretBulletManager(scene);
turret.addBulletManager(turretBulletManager);
var playerBulletManager = new PlayersBulletManager(scene);
player.addBulletManager(playerBulletManager);
var foeBulletManager = new PlayersBulletManager(scene);
foe.addBulletManager(foeBulletManager);


// var bullets = new Map();
// var playerBullets = new Map();
// var foeBullets = new Map();


const light = new THREE.AmbientLight( 0xffffff ); // soft white light 
light.intensity = 0.5;
scene.add( light );

const light2 = new THREE.DirectionalLight( 0xffffff, 10);
// light2.position.set(camera.position.x, camera.position.y, camera.position.z);
light2.position.set(10, 10, 10); // Position the light above and to the side of the scene
light2.lookAt(0, 0, 0);
// light2.lookAt(0, 0, 0);
// light2.decay = 0;
scene.add( light2 );

let limit = 0;
let limit1 = 0;
let limit2 = 0;
var playerSyncData = new PlayerData();
foe.attachControls(playerSyncData);


var animate = (s) => {
    const planeFacingVector = getCameraDir(camera);
    // findPlayerAngle();
    player.update(s, planeFacingVector);
    foe.update(s, planeFacingVector);

    // if (limit > 5) {
    //     limit = 0;
    //     player.fire(keyControls, playerBullets);
    // }


    // let dateNow = Date.now();
    turretBulletManager.update();
    playerBulletManager.update();
    foeBulletManager.update();
    // let dateNow = new Date().valueOf();
    // bullets.forEach((elem, key) => {
    //     if (dateNow > elem.date + 10 * 1000) {
    //         scene.remove(elem);
    //         bullets.delete(key);
    //     }
    //     else
    //         elem.update();
    // })
    // playerBullets.forEach((elem, key) => {
    //     if (dateNow > elem.date + 10 * 1000) {
    //         scene.remove(elem);
    //         playerBullets.delete(key);
    //     }
    //     else
    //         elem.update();
    // })
    // foeBullets.forEach((elem, key) => {
    //     if (dateNow > elem.date + 10 * 1000) {
    //         scene.remove(elem);
    //         foeBullets.delete(key);
    //     }
    //     else
    //         elem.update();
    // })

    if (limit1 > 4) {
		limit1 = 0;
		let scale = 1;
        switch (musicSyncer.isBigBoom()) {
            case 1:
                scale = 1.2;
			    turret.fire(0xfc7703);
			    turret.update(s);
                break;
            case 2:
                scale = 1.2;
			    turret.fire(0xff0000);
			    turret.update(s);
                break;
        }
		turret.scale.set(scale, scale, scale)

	}

    
    limit++;
    limit1++;

    if (playerSyncData.position) {
        // console.log('pos: ', playerSyncData.position);
        foe.position.set(playerSyncData.position.x, playerSyncData.position.y, playerSyncData.position.z);
        playerSyncData.position = null;
    }
    // foe.move(s, playerSyncData.move, planeFacingVector);

    var vex = new THREE.Vector3();

	// let threshold = 4;
    turretBulletManager.checkCollision(player);
    turretBulletManager.checkCollision(foe);
    playerBulletManager.checkCollision(foe);
    foeBulletManager.checkCollision(player);
	// for(var [key, bullet] of bullets) {
	// 	vex.subVectors(player.position, bullet.position);
	// 	if (vex.length() < threshold) {
	// 		bullets.get(key).material.color.set(0x000000);
	// 		// flashRed = 10;
	// 		break;
	// 	}
	// 	if (bullets.get(key).material.color.getHex() === 0xff0000)
	// 		continue;
	// 	for(let [Pkey, PlayerBullet] of playerBullets) {
	// 		vex.subVectors(PlayerBullet.position, bullet.position);
	// 		if (vex.length() < threshold) {
	// 			scene.remove(bullet);
	// 			scene.remove(PlayerBullet);
	// 			playerBullets.delete(Pkey);
	// 			bullets.delete(key);
	// 			// flashRed = 10;
	// 			break;
	// 		}
	// 	}
	// }

}

gClock.loop(animate);

const connection = new Connection(keyControls, playerSyncData);
connection.connectToServer(friend.id);

document.getElementById('RTCconnect').addEventListener('click', connection.startRtcConnection.bind(connection));

// var socket;
// document.getElementById('msgSender').addEventListener('click', send);
// document.getElementById('connector').addEventListener('click', connect);
