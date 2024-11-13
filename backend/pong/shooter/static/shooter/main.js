import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { KeyControls, PlayerData, getCameraDir } from './keyControl.js';
import { gameClock } from './gclock.js';
import { Turret, Player, TurretBulletManager, PlayersBulletManager } from './assets.js';
import { MusicSync } from './sound.js';
import { Connection } from './connection.js';
import { musicMap } from './reolMap.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio * 1);

document.body.appendChild( renderer.domElement );

// var playerData = new PlayerData();

var friend = user.id === users[0].id ? users[1] : users[0];


const musicSyncer = new MusicSync(camera);
musicSyncer.loadMusic('/static/shooter/assets/No_title.mp3');
musicSyncer.addMusicMap(musicMap);
musicSyncer.bullet = musicSyncer.loadNewSound('/static/shooter/assets/a6.mp3');

// const musicMap = map;

var mapIterator = musicMap.entries();
var entry = mapIterator.next();

let limit1 = 0;

function startGame(timeStamp) {
        musicSyncer.stopMusic();
    setTimeout(() => {
        while(timeStamp > performance.now());
        musicSyncer.playMusic();
        limit1 = 0;
        turret.fireAngle = 0;
    }, (timeStamp - performance.now()) - 30);
}

function startMusic(timeStamp) {
        musicSyncer.playMusic();
        console.log("game started with ", musicSyncer);
}
// var csvContent = "";
// for (var [key, array] of temp0) {
//     csvContent += key + ",";
//     for (var elem of array) {
//         csvContent += elem + ",";
//     }
//     csvContent += "\n";
// }
// const blob = new Blob([csvContent], { type: 'text/csv' });

// // Create a temporary link element
// const link = document.createElement('a');
// link.href = URL.createObjectURL(blob);
// link.download = 'data.csv';

// // Append the link to the body
// document.body.appendChild(link);

// // Trigger the download by simulating a click
// link.click();

// // Remove the link from the document
// document.body.removeChild(link);




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

const player = new Player({x: 10, y: 3, z: -10});

player.addToScene(scene);
player.addBulletSound(musicSyncer.bullet);

const foe = new Player({x: -10, y: 3, z: 10});

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
// let limit1 = 0;
let limit2 = 0;
var playerSyncData = new PlayerData(foe);
foe.attachControls(playerSyncData);

var hit = false;
var musicPlaying = true;
var keepFioring = false;
var scale = 1;


// turretBulletManager.spawnBullet(0xfc7703, {x: 30, y: 3, z: 30}, {x: 0.2, y: 0, z: 0});

var foeActionOrder = 0;

function rollBack() {
    const planeFacingVector = getCameraDir(camera);
    // (in the makeBackUp method) if a new action arrives and its time stamp is old send a full description request;
    // let actions = [...playerSyncData.actions.entries()]. sort((a, b) => a[0] - b[0]);
    // let idx = 0;
    let timeDiff = 2;// get from connection

    if (!playerSyncData.actions.has(foeActionOrder))
        return;
    console.log('rollback');
    let timeStampTransformed  = playerSyncData.actions.get(foeActionOrder).timeStamp - timeDiff;
    foe.despawnUncertainBullets(timeStampTransformed);// later only despown bullet that 
    foe.position.copy(playerSyncData.backUpPosition);
    while (timeStampTransformed < performance.now()) {
        turretBulletManager.findPositionAtTime(timeStampTransformed);
        player.findPositionAtTime(timeStampTransformed);

        while (playerSyncData.actions.has(foeActionOrder)) {
            ActionTime = playerSyncData.actions.get(foeActionOrder).timeStamp - timeDiff;
            if (ActionTime > timeStampTransformed) {
                break;
            }
            playerSyncData.applyAction(playerSyncData.actions.get(foeActionOrder));
            playerSyncData.actions.delete(foeActionOrder);
            foeActionOrder++;
        }
        foe.update(gClock.msPerFrame, planeFacingVector);


        turretBulletManager.findPositionAtTime(timeStampTransformed);
        playerBulletManager.findPositionAtTime(timeStampTransformed);
        foeBulletManager.findPositionAtTime(timeStampTransformed);


        turretBulletManager.checkRollbackCollision(player, s);
        turretBulletManager.checkRollbackCollision(foe, s);
        playerBulletManager.checkRollbackCollision(foe, s);
        foeBulletManager.checkRollbackCollision(player, s);

        timeStampTransformed += gClock.msPerFrame;
    }

    turretBulletManager.batchUndestroyBullet();
    turretBulletManager.batchUndestroyBullet();
    playerBulletManager.batchUndestroyBullet();
    foeBulletManager.batchUndestroyBullet();

    // save for next roll back
    playerSyncData.backUpPosition.copy(foe.position);
}

var animate = (s) => {
    const planeFacingVector = getCameraDir(camera);
    if (playerSyncData.rollback) {
        // console.log('rollback starting');
        playerSyncData.rollback = false;
        rollBack();
        console.log('rollback done');
    }
    player.update(s, planeFacingVector);
    foe.update(s, planeFacingVector);

    turretBulletManager.update(s);
    playerBulletManager.update(s);
    foeBulletManager.update(s);


//================================================================================================
    // if (limit1 > 8) {
	// 	limit1 = 0;
	// 	let scale = 1;
    //     switch (musicSyncer.isBigBoom()) {
    //         case 1:
    //             scale = 1.2;
	// 		    turret.fire(0xfc7703);
	// 		    turret.update(s);
    //             break;
    //         case 2:
    //             scale = 1.2;
	// 		    turret.fire(0xff0000);
	// 		    turret.update(s);
    //             break;
    //     }
	// 	turret.scale.set(scale, scale, scale)

	// }

    // if (musicSyncer.musicPlaying)
    //     musicSyncer.isBigBoom();
//================================================================================================
    if (limit > 5) {
        limit = 0;
        scale = 1;
    }

    let beat = musicSyncer.nextBeat();
    if (beat.value) {
        limit = 0;
        scale = 1.2;
        turret.update(s);
    }
    if (beat.new && beat.value === 1) {
        // console.log("beat: ", beat);
        limit1 = 0;
    }

    switch (beat.value) {
        case 1:
            turret.fire(0xfc7703);
            break;
        case 2:
            turret.fire(0xff0000);
            turret.fireAtAngle(0xff0000, Math.PI / 8);
            turret.fireAtAngle(0xff0000, 2 * Math.PI / 8);
            turret.fireAtAngle(0xff0000, 3 * Math.PI / 8);
            break;
    }
    turret.scale.set(scale, scale, scale)
    
    limit++;
    limit1++;

    if (playerSyncData.position) {
        // console.log('pos: ', playerSyncData.position);
        foe.position.set(playerSyncData.position.x, playerSyncData.position.y, playerSyncData.position.z);
        playerSyncData.position = null;
    }

    turretBulletManager.checkCollision(player, s);
    turretBulletManager.checkCollision(foe, s);
    playerBulletManager.checkCollision(foe, s);
    foeBulletManager.checkCollision(player, s);
}

gClock.loop(animate);

const connection = new Connection(keyControls, playerSyncData);
connection.connectToServer(friend.id);
connection.attatchGameStart(startGame);



// document.getElementById('RTCconnect').addEventListener('click', connection.startRtcConnection.bind(connection));

// var socket;
// document.getElementById('msgSender').addEventListener('click', send);
// document.getElementById('connector').addEventListener('click', connect);
