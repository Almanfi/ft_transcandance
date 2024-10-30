import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { KeyControls, PlayerData, getCameraDir } from './keyControl.js';
import { gameClock } from './gclock.js';
import { Turret, Player } from './assets.js';
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

const player = new Player({x: 0, y: 0, z: 0});

player.addToScene(scene);

const keyControls = new KeyControls(player);
const gClock = new gameClock(scene, camera, renderer);


camera.position.x = 50;
camera.position.y = 300;
camera.position.z = -30;

camera.lookAt(0,0,0);

var turret = new Turret({initPosition: {x: 10, y: 3, z: 10}, rotationSpeed: 0.1, speed: 1});
turret.addToScene(scene);

var bullets = new Map();


const light = new THREE.AmbientLight( 0xffffff ); // soft white light 
light.intensity = 0.5;
scene.add( light );

const light2 = new THREE.DirectionalLight( 0xffffff, 1);
light2.position.set(camera.position.x, camera.position.y, camera.position.z);
light2.intensity = 0.8;
// light2.decay = 0;
scene.add( light2 );

let limit = 0;
let limit1 = 0;
let limit2 = 0;
var playerSyncData = new PlayerData();


const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2( 1, 1 );

function onMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}
document.addEventListener( 'mousemove', onMouseMove );

function findPlayerAngle() {
    raycaster.setFromCamera( mouse, camera );

	const intersection = raycaster.intersectObject( plane );

    if ( intersection.length > 0 ) {
		// const instanceId = intersection[ 0 ].instanceId;
		const point = intersection[ 0 ].point;
		
		let dx = point.x - player.position.x;
		let dz = point.z - player.position.z;
		if (dz)
			angle = Math.atan(dx / dz) + 0 * Math.PI / 2;
		if (dz > 0) {
			angle += 1 * Math.PI;
	   }
       direction.set(dx, 0, dz).normalize().multiplyScalar(2);
	}

}

var angle = 0;
let direction = new THREE.Vector3(0, 0, 0);

var animate = (s) => {
    const planeFacingVector = getCameraDir(camera);
    findPlayerAngle();
    player.update(s, keyControls, planeFacingVector, angle, direction);

    if (limit > 5) {
        limit = 0;
        player.fire(keyControls, null);
    }


    // let dateNow = Date.now();
    let dateNow = new Date().valueOf();
    bullets.forEach((elem, key) => {
        if (dateNow > elem.date + 10 * 1000) {
            scene.remove(elem);
            bullets.delete(key);
        }
        else
            elem.update();
    })

    if (limit1 > 4) {
		limit1 = 0;
		let scale = 1;
        switch (musicSyncer.isBigBoom()) {
            case 1:
                scale = 1.2;
			    turret.fire(0xfc7703, bullets);
			    turret.update();
                break;
            case 2:
                scale = 1.2;
			    turret.fire(0xff0000, bullets);
			    turret.update();
                break;
        }
		turret.scale.set(scale, scale, scale)

	}

    
    limit++;
    limit1++;

    if (playerSyncData.position) {
        console.log('pos: ', playerSyncData.position);
        player.position.set(playerSyncData.position.x, playerSyncData.position.y, playerSyncData.position.z);
        playerSyncData.position = null;
    }
    player.move(s, playerSyncData.move, planeFacingVector);

}

gClock.loop(animate);

const connection = new Connection(keyControls, playerSyncData);

connection.connectToServer(friend.id);
document.getElementById('RTCconnect').addEventListener('click', connection.startRtcConnection.bind(connection));

// var socket;
// document.getElementById('msgSender').addEventListener('click', send);
// document.getElementById('connector').addEventListener('click', connect);
