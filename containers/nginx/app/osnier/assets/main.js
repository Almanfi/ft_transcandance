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

console.log(user.username);


const musicSyncer = new MusicSync(camera);
musicSyncer.loadMusic('/static/shooter/assets/No_title.mp3');
musicSyncer.addMusicMap(musicMap);
musicSyncer.bullet = musicSyncer.loadNewSound('/static/shooter/assets/a6.mp3');

// const musicMap = map;

var mapIterator = musicMap.entries();
var entry = mapIterator.next();

let limit1 = 0;

function startGame(timeStamp) {
    console.log('starting game in: ', timeStamp - new Date().valueOf());
    plane.material.color.setHex(0x000000);
        musicSyncer.stopMusic();
        turretBulletManager.reset();
        playerBulletManager.reset();
        foeBulletManager.reset();
    setTimeout(() => {
        // while(timeStamp > new Date().valueOf());
        plane.material.color.setHex(0xcccccd);
        gClock.setStartTime(musicSyncer.playMusic());
        limit1 = 0;
        turret.fireAngle = 0;
        keyControls.actionOrder = 0;
        playerSyncData.actionOrder = 0;
        player.actionOrder = 0;
        player.actions.clear();
        playerSyncData.actions.clear();
        gClock.frameCount = 0;
        turretBulletManager.reset(gClock.startTime);
        playerBulletManager.reset(gClock.startTime);
        foeBulletManager.reset(gClock.startTime);
        player.reset();
        foe.reset();
    }, (timeStamp - new Date().valueOf()));
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

const positions = [
    {x: 10, y: 3, z: -10},
    {x: -10, y: 3, z: 10}
];


if (user.username === 'ana')
    positions.reverse();

const player = new Player(positions[0]);
player.name = "player";

player.addToScene(scene);
player.addBulletSound(musicSyncer.bullet);

const foe = new Player(positions[1]);
foe.name = "foe";

foe.addToScene(scene);
foe.addBulletSound(musicSyncer.bullet);

const keyControls = new KeyControls(player, camera);
const gClock = new gameClock(scene, camera, renderer);


// camera.position.x = 20;
// camera.position.y = 150;
// camera.position.z = -10;
camera.position.x = 0;
camera.position.y = 150;
camera.position.z = 0;

camera.lookAt(0,0,0);

if (user.username == 'ana')
    player.add(camera);
else
    foe.add(camera);

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

var justRolledBack = false;

function rollBack(startTime) {
    const planeFacingVector = getCameraDir(camera);
    // (in the makeBackUp method) if a new action arrives and its time stamp is old send a full description request;
    // let actions = [...playerSyncData.actions.entries()]. sort((a, b) => a[0] - b[0]);
    // let idx = 0;
    if (playerSyncData.actions.size === 0)
        return;
    let timeDiff = connection.timeDiffAvrg;// get from connection
    let foeActionOrder = playerSyncData.actionOrder;

    
    if (!playerSyncData.actions.has(foeActionOrder))
        return;
    // let startTime = new Date().valueOf();
    // let timeStampTransformed  = playerSyncData.actions.get(foeActionOrder).timeStamp - timeDiff;
    // if (startTime - timeStampTransformed < 0)
    //     return;
    let currentTime = new Date().valueOf() - startTime;
    let actionTime = playerSyncData.actions.get(foeActionOrder).timeStamp;
    
    if (currentTime < actionTime)
        return;
    // console.log('current time (ms): ', currentTime);
    // console.log('action time (ms): ', actionTime);
    console.log('roll back (ms): ', currentTime - actionTime);
    
    let lastFrameIdx = 0;
    let lastFrameTime;
    // for (let i = 4; i > 0; i--) {
    //     let FrameTime = gClock.getFrameTime(i);
    //     console.log(`FrameIdx : ${i} FrameTime: ${FrameTime}`);
    // }
    while (lastFrameIdx < 60) {
        lastFrameTime = gClock.getFrameTime(lastFrameIdx);
        // console.log(`lastFrameIdx : ${lastFrameIdx} lastFrameTime: ${lastFrameTime} actionTime: ${actionTime}`);
        lastFrameIdx++;
        if (lastFrameTime <= actionTime)
            break;
    }
    if (lastFrameIdx === 60 && lastFrameTime < actionTime) {
        console.log('lastFrameIdx is too big: ', lastFrameIdx);
        return false;// this is an error
    }
    // console.log('lastFrameIdx: ', lastFrameIdx);
    // console.log('time: ', lastFrameTime, ' timeStampTransformed: ', timeStampTransformed);
    // actionTime = lastFrameTime;

    foe.despawnUncertainBullets(lastFrameTime);// later only despown bullet that
    // console.log("-----------------finding player at time: ", lastFrameTime); 
    foe.findStateAtTime(lastFrameTime);
    // console.log('found player at time: ', lastFrameTime, ' with position: ', foe.position);
    console.log("+++++++++++++++++finding player at time: ", lastFrameTime);
    // foe.actions.clear();

    while (lastFrameIdx > 0) {
        lastFrameIdx--;
        // console.log('loop lastFrameIdx: ', lastFrameIdx);
        let nextFrameTime = gClock.getFrameTime(lastFrameIdx);
        const frameSpan = nextFrameTime - lastFrameTime;
        
        player.findPositionAtTime(lastFrameTime);
        
        let lastActionTime = lastFrameTime;
        while (playerSyncData.actions.has(foeActionOrder)) {
            // console.log('last action time: ', lastActionTime);
            let ActionTime = playerSyncData.actions.get(foeActionOrder).timeStamp;
            
            if (ActionTime >= nextFrameTime) {
                break;
            }
            // console.log('applying foeActionOrder : ', foeActionOrder);
            console.log(' action : ', JSON.stringify(playerSyncData.actions.get(foeActionOrder)));
            foe.rollbackActoin(playerSyncData.actions.get(foeActionOrder), lastActionTime, planeFacingVector, lastFrameTime);
            // playerSyncData.applyAction(playerSyncData.actions.get(foeActionOrder));
            playerSyncData.actions.delete(foeActionOrder);
            lastActionTime = ActionTime;
            foeActionOrder++;
        }
        if (lastActionTime < nextFrameTime) {
            console.log('fninishing action from time: ', lastActionTime, " to: ", nextFrameTime);
            let timeS = nextFrameTime - lastActionTime;
            foe.update(timeS, planeFacingVector, lastActionTime, lastFrameTime);
            console.log(`after finishing action at time : ${nextFrameTime} position: ${JSON.stringify(foe.position)}`);
        }

        // foe.update(frameSpan, planeFacingVector, lastFrameTime, startTime);
        // foe.rollBack(lastFrameTime);


        turretBulletManager.findPositionAtTime(lastFrameTime);
        playerBulletManager.findPositionAtTime(lastFrameTime);
        foeBulletManager.findPositionAtTime(lastFrameTime);


        turretBulletManager.checkRollbackCollision(player, frameSpan, lastFrameTime);
        turretBulletManager.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        playerBulletManager.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        foeBulletManager.checkRollbackCollision(player, frameSpan, lastFrameTime);

        lastFrameTime = nextFrameTime;
    }

    turretBulletManager.batchUndestroyBullet();
    turretBulletManager.batchUndestroyBullet();
    playerBulletManager.batchUndestroyBullet();
    foeBulletManager.batchUndestroyBullet();



    // while (playerSyncData.actions.has(foeActionOrder)) {
    //     let ActionTime = playerSyncData.actions.get(foeActionOrder).timeStamp - timeDiff;
    //     if (ActionTime > lastFrameTime) {
    //         break;
    //     }
    //     // console.log('applying foeActionOrder : ', foeActionOrder);
    //     playerSyncData.applyAction(playerSyncData.actions.get(foeActionOrder));
    //     playerSyncData.actions.delete(foeActionOrder);
    //     foeActionOrder++;
    // }

    // save for next roll back
    // playerSyncData.backUpPosition.copy(foe.position);
    playerSyncData.actionOrder = foeActionOrder;
   console.log('roll back time: ', new Date().valueOf() - startTime - currentTime);
   justRolledBack = true;
}

var animate = (s, timeStamp) => {
    let startTime = gClock.startTime;
    const planeFacingVector = getCameraDir(camera);
    if (justRolledBack) {
        let lastFrame = gClock.getFrameTime(0);
        let span = timeStamp - lastFrame;
        // console.log('just rolled back at time: ', timeStamp, ' span: ', span);
        // console.log('(just rolled back) before animete at time', lastFrame, ' postion: ', foe.position);
        foe.update(span, planeFacingVector, lastFrame, lastFrame);
        // console.log('(just rolled back) before animete at time', timeStamp, ' postion: ', foe.position);
    }

    let actionTime = timeStamp;
    player.update(s, planeFacingVector, timeStamp, timeStamp);
    foe.update(s, planeFacingVector, timeStamp, timeStamp);

    if (justRolledBack) {
        // console.log('(just rolled back) after animete at time', timeStamp + s, ' postion: ', foe.position);
        justRolledBack = false;
    }

    turretBulletManager.update(timeStamp);
    playerBulletManager.update(timeStamp);
    foeBulletManager.update(timeStamp);

    if (limit > 5) {
        limit = 0;
        scale = 1;
    }

    let beat = musicSyncer.findCurrentBeat();

    let listen = true;
    if (listen && beat && beat.type && !beat.handled) {
        beat.handled = true;
        // console.log('beat: ', beat);
        // console.log(new Date().valueOf() - startTime);
        limit = 0;
        scale = 1.2;
        turret.update(beat.time, startTime);

        switch (beat.type) {
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
    }

    turret.scale.set(scale, scale, scale)
    
    limit++;

    turretBulletManager.checkCollision(player, s);
    turretBulletManager.checkCollision(foe, s);
    playerBulletManager.checkCollision(foe, s);
    foeBulletManager.checkCollision(player, s);
}

gClock.loop(animate, rollBack);

const connection = new Connection(keyControls, playerSyncData);
connection.connectToServer(friend.id);
connection.attatchGameStart(startGame);



// document.getElementById('RTCconnect').addEventListener('click', connection.startRtcConnection.bind(connection));

// var socket;
// document.getElementById('msgSender').addEventListener('click', send);
// document.getElementById('connector').addEventListener('click', connect);
