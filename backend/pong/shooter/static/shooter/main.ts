import * as THREE from 'three';
import { initPlane, PlayersBulletManager, TurretBulletManager, Turret } from './assets.js';
import { Player, Inputs } from './player.js';
import { KeyControls, getCameraDir } from './keyControls.js';
import { gameClock } from './gclock.js';
import { MusicSync } from './sync.js';
import { musicMap } from './assets/reolMap.js';
import { Connection } from './connection.js';
import { dataSaved } from './rollback.js';

function initThreeJS(): { scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer } {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(20, 150, -10);
    camera.lookAt(0,0,0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio * 1);

    document.body.appendChild( renderer.domElement );

    const light = new THREE.AmbientLight( 0xffffff );
    light.intensity = 0.5;
    scene.add( light );

    const light2 = new THREE.DirectionalLight( 0xffffff, 10);
    light2.position.set(10, 10, 10);
    light2.lookAt(0, 0, 0);
    scene.add( light2 );

    return { scene, camera, renderer };
}

declare var user: any;
declare var users: any;

let player2 = user.id === users[0].id ? users[1] : users[0];
console.log('user: ', user, ' foe: ', player2);

const { scene, camera, renderer } = initThreeJS();
const keyControls = new KeyControls(camera);
const gClock = new gameClock(scene, camera, renderer);
const connection = new Connection();
connection.init(player2.id);
const musicSyncer = new MusicSync(camera);
musicSyncer.loadMusic('/static/shooter/assets/No_title.mp3');
musicSyncer.addMusicMap(musicMap);
const bulletSound = musicSyncer.loadNewSound('/static/shooter/assets/a6.mp3');

const plane = initPlane();
scene.add(plane);


const turretBulletM = new TurretBulletManager(scene);
const turret = new Turret(turretBulletM, {initPosition: new THREE.Vector3(5, 0, 0)});
turret.addToScene(scene);

const playerBulletM = new PlayersBulletManager(scene);
const player = new Player(new THREE.Vector3(0, 0, 0), playerBulletM);
player.addToScene(scene);
player.add(camera);
player.addBulletSound(bulletSound);

const foeBulletM = new PlayersBulletManager(scene);
const foe = new Player(new THREE.Vector3(0, 0, 0), foeBulletM);
foe.addToScene(scene);
foe.addBulletSound(bulletSound);


const planeFacingVector = getCameraDir(camera);
player.setPlaneVector(planeFacingVector);
foe.setPlaneVector(planeFacingVector);


var justRolledBack = false;

function rollBack(startTime: number) {
    let currentTime = performance.now() - startTime;
    const planeFacingVector = getCameraDir(camera);

    if (connection.hasRecievedData() === false)
        return ;
    let recievedData = connection.getRecievedDataOrdered();

    let actionTime = Inputs.findTimeStamp(recievedData as string);
    if (currentTime < actionTime) // back to the future!
        return;

    let finalFrameIndex = gClock.getFrameIndex(currentTime);
    let lastFrameIndex = gClock.getFrameIndex(actionTime);
    if (lastFrameIndex < 0)
        throw Error("could not find the frame");
    let lastFrameTime = gClock.getFrameTime(lastFrameIndex);

    foe.despawnUncertainBullets(lastFrameTime);// later only despown bullet that
    foe._findStateInFrame(lastFrameIndex);
    // foe.findStateAtTime(lastFrameTime);
    // foe.actions.clear();

    while (lastFrameIndex < finalFrameIndex) {
        let nextFrameTime = gClock.getFrameTime(lastFrameIndex + 1);
        const frameSpan = nextFrameTime - lastFrameTime;
        
        player._findPositonInFrame(lastFrameIndex);// underscore methods are unsafe
        
        let lastActionTime = lastFrameTime;
        while (connection.hasRecievedData()) {
            if (actionTime >= nextFrameTime)
                break;
            recievedData = connection.getRecievedDataOrdered();
            foe.rollbackActoin(recievedData, lastActionTime, planeFacingVector, lastFrameTime);
            lastActionTime = actionTime;
            connection.next();
        }
        if (lastActionTime < nextFrameTime) {
            console.log('fninishing action from time: ', lastActionTime, " to: ", nextFrameTime);
            let timeS = nextFrameTime - lastActionTime;
            foe.update(timeS, lastActionTime, lastFrameTime);
            // console.log(`after finishing action at time : ${nextFrameTime} position: ${JSON.stringify(foe.position)}`);
        }

        turretBulletM.findPositionAtTime(lastFrameTime);
        playerBulletM.findPositionAtTime(lastFrameTime);
        foeBulletM.findPositionAtTime(lastFrameTime);

        turretBulletM.checkRollbackCollision(player, frameSpan, lastFrameTime);
        turretBulletM.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        playerBulletM.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        foeBulletM.checkRollbackCollision(player, frameSpan, lastFrameTime);

        lastFrameTime = nextFrameTime;
        lastFrameIndex++;
    }

    turretBulletM.batchUndestroyBullet();
    turretBulletM.batchUndestroyBullet();
    playerBulletM.batchUndestroyBullet();
    foeBulletM.batchUndestroyBullet();

    console.log('roll back time: ', performance.now() - startTime - currentTime);
    justRolledBack = true;
}

var animate = (span: number, timeStamp: number) => {
    let frameIndex = gClock.getFrameIndex(timeStamp);
    handleInputs(span, timeStamp);
    let startTime = gClock.startTime;
    // if (justRolledBack) {
    //     let lastFrame = gClock.getFrameTime(0);
    //     let span = timeStamp - lastFrame;
    //     // console.log('just rolled back at time: ', timeStamp, ' span: ', span);
    //     // console.log('(just rolled back) before animete at time', lastFrame, ' postion: ', foe.position);
    //     foe.update(span, planeFacingVector, lastFrame, lastFrame);
    //     // console.log('(just rolled back) before animete at time', timeStamp, ' postion: ', foe.position);
    // }

    player.update(span, timeStamp, timeStamp);
    player.savePlayerData(frameIndex);
    playerBulletM.update(timeStamp);
    // foe.update(span, planeFacingVector, timeStamp, timeStamp);

    let beat = musicSyncer.findCurrentBeat();
    if (beat)
        turret.sync(beat);
    turretBulletM.update(timeStamp);


    // if (justRolledBack) {
    //     // console.log('(just rolled back) after animete at time', timeStamp + span, ' postion: ', foe.position);
    //     justRolledBack = false;
    // }


    turretBulletM.checkCollision(player, span);
    // turretBulletManager.checkCollision(foe, span);
    // playerBulletManager.checkCollision(foe, span);
    // foeBulletManager.checkCollision(player, span);
}

function handleInputs(span: number, timeStamp: number) {
    let recievedData = connection.getRecievedDataOrdered();
    if (recievedData) {
        player.inputs.deserialize(recievedData);
        return ;
    }
    
    if (!keyControls.checkforNewInputs())
        return ;
    keyControls.setAsHandeled();

    let playerPosition = player.position;
    let {angle, direction} = keyControls.findPlayerAngle(playerPosition)
    let move = keyControls.findPlayerMove();
    let action = keyControls.findPlayerAction();
    if (action.d) {
        startGame(performance.now() + 1000);
    }

    let inputs = player.inputs.set(move, angle,
                    direction, action, timeStamp);
    let data = inputs.serializeForSend();
    connection.send(JSON.stringify(data));
};

function startGame(timeStamp) {
    console.log('starting game in: ', timeStamp - performance.now());
        musicSyncer.stopMusic();
        turretBulletM.reset();
        playerBulletM.reset();
        player.reset();
        connection.reset();
    setTimeout(() => {
        // while(timeStamp > performance.now());
        gClock.setStartTime(musicSyncer.playMusic());
        gClock.frameCount = 0;
        turretBulletM.reset();
        playerBulletM.reset();
        player.reset();
        turret.reset();
        connection.reset();
    }, (timeStamp - performance.now()));
}

function setPlaneVector(camera: THREE.Camera, player: Player, foe: Player) {
    const planeFacingVector = getCameraDir(camera);
    player.setPlaneVector(planeFacingVector);
    foe.setPlaneVector(planeFacingVector);
}

gClock.loop(animate, rollBack);
// gClock.setStartTime(musicSyncer.playMusic());
gClock.setStartTime(musicSyncer.startTime);

// const connection = new Connection(keyControls, playerSyncData);
// connection.connectToServer(friend.id);
// connection.attatchGameStart(startGame);


