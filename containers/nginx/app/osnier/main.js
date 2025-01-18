import * as THREE from 'three';
import { Plane, PlayersBulletManager, TurretBulletManager, Turret } from './assets.js';
import { Player, Inputs } from './player.js';
import { KeyControls, getCameraDir } from './keyControls.js';
import { gameClock } from './gclock.js';
import { MusicSync } from './sync.js';
import { musicMap } from './assets/reolMap.js';
import { Connection } from './connection.js';
import { UIRanderer } from './UIRanderer.js';
import { getGame, getUser } from './utils.js';
// import { CSS2DObject, CSS2DRenderer } from './node_modules/three/examples/jsm/renderers/CSS2DRenderer.js';
function initThreeJS(gameConvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200000);
    // camera.position.set(0, 100000, 0);
    camera.position.set(20, 100000, -10);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1);
    let Convas = gameConvas.appendChild(renderer.domElement);
    const light = new THREE.AmbientLight(0xffffff);
    light.intensity = 0.5;
    scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 10);
    light2.position.set(10, 10, 10);
    light2.lookAt(0, 0, 0);
    scene.add(light2);
    return { scene, camera, renderer };
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const gameId = urlParams.get('id');
if (!gameId)
    throw Error('no game id'); // this should never happen
let port = 8000;
let endPoint = "https://" + window.location.hostname + ":" + port;
let gameDataArr = await getGame(endPoint, gameId);
let user = await getUser(endPoint);
let gameData = gameDataArr[0];
console.log('game data: ', gameData);
console.log('user: ', user);
console.log("game data team a: ", gameData["team_a"]);
console.log("game data team b: ", gameData["team_b"]);
let users = [gameData.team_a[0], gameData.team_b[0]];
console.log('users: ', users);
let player2 = user.id === users[0].id ? users[1] : users[0];
console.log('user: ', user, ' foe: ', player2);
let playersPos = [new THREE.Vector3(12000, 0, 0), new THREE.Vector3(-12000, 0, 0)];
if (user.id === users[1].id)
    playersPos = [new THREE.Vector3(-12000, 0, 0), new THREE.Vector3(12000, 0, 0)];
const gameConvas = document.getElementById('osnier');
const { scene, camera, renderer } = initThreeJS(gameConvas);
const UIRander = new UIRanderer(gameConvas);
UIRander.loadPlayer1Text("player1");
UIRander.loadPlayer2Text("player2333flkdfdsf");
UIRander.loadPlayer1Image("assets/image.png");
UIRander.loadPlayer2Image("assets/image.png");
UIRander.loadCounter();
UIRander.render();
const keyControls = new KeyControls(camera, gameConvas);
window.addEventListener('resize', () => {
    console.log('resize');
    let convasSize = gameConvas.getBoundingClientRect();
    const width = convasSize.width;
    const height = convasSize.height;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    UIRander.resize(width, height);
    UIRander.render();
    keyControls.recalibrateMouse();
});
const gClock = new gameClock(scene, camera, renderer);
const connection = new Connection();
connection.init(player2.id);
connection.attatchGameStart(startGame);
const musicSyncer = new MusicSync(camera, signalEndGame);
musicSyncer.loadMusic('assets/No_title.mp3');
musicSyncer.addMusicMap(musicMap);
const bulletSound = musicSyncer.loadNewSound('assets/a6.mp3');
// const healthBar = document.createElement('div');
// healthBar.style.width = '100px';
// healthBar.style.height = '20px';
// healthBar.style.backgroundColor = 'red';
// const healthBarObject = new CSS2DObject(healthBar);
// healthBarObject.position.set( -10, 10, 0 ); // Position the UI element
// scene.add(healthBarObject);
// // Create a CSS2DRenderer
// const labelRenderer = new CSS2DRenderer();
// labelRenderer.setSize( window.innerWidth, window.innerHeight );
// labelRenderer.domElement.style.position = 'absolute';
// labelRenderer.domElement.style.top = '0px';
// document.body.appendChild( labelRenderer.domElement );
const plane = new Plane();
scene.add(plane);
const turretBulletM = new TurretBulletManager(scene);
const turret = new Turret(turretBulletM, { initPosition: new THREE.Vector3(15, 0, 0) });
turret.addToScene(scene);
turretBulletM.addPlane(plane);
const playerBulletM = new PlayersBulletManager(scene);
const player = new Player(playersPos[0], playerBulletM);
player.addToScene(scene);
player.add(camera);
player.addBulletSound(bulletSound);
player.name = "player";
player.setPlane(plane);
player.addUIRenderer(UIRander);
playerBulletM.addPlane(plane);
player.attachEndGameSignal(signalEndGame);
const foeBulletM = new PlayersBulletManager(scene);
const foe = new Player(playersPos[1], foeBulletM);
foe.addToScene(scene);
foe.addBulletSound(bulletSound);
foe.name = "foe";
foe.setPlane(plane);
foe.addUIRenderer(UIRander);
foeBulletM.addPlane(plane);
foe.attachEndGameSignal(signalEndGame);
const planeFacingVector = getCameraDir(camera);
player.setPlaneVector(planeFacingVector);
foe.setPlaneVector(planeFacingVector);
var justRolledBack = false;
let frameError = 0;
function rollBack(startTime, type) {
    // while (true) {
    //     let recievedData1 = connection.getRecievedDataOrdered();
    //     if (!recievedData1)
    //         break;
    //     foe.inputs.deserialize(recievedData1);
    //     connection.next();
    // }
    // return ;
    if (frameError > 5)
        return;
    let currentTime = new Date().valueOf() - startTime;
    if (connection.hasRecievedData() === false)
        return;
    // console.log("initing roll back of type : ", type);
    // console.log('received data order ', connection.recievedDataOrder);
    let recievedData = connection.getRecievedDataOrdered();
    // console.log(`received ${connection.recievedDataOrder} data: `, recievedData);
    let actionTime = Inputs.findTimeStamp(recievedData);
    // console.log('action time: ', actionTime, ' received data: ', JSON.stringify(recievedData));
    if (currentTime < actionTime) // back to the future!
        return;
    // console.log("====================================");
    // console.log('rolling back : ', currentTime - actionTime);
    let finalFrameIndex = gClock.getFrameIndex(currentTime);
    let lastFrameIndex = gClock.getFrameIndex(actionTime);
    if (lastFrameIndex < 0) {
        frameError++;
        console.log('invalid frame index: ', lastFrameIndex);
        return;
        throw Error("could not find the frame");
    }
    if (lastFrameIndex === finalFrameIndex)
        return;
    // console.log('roll back from frame: ', lastFrameIndex, ' to: ', finalFrameIndex);
    let lastFrameTime = gClock.getFrameTime(lastFrameIndex);
    // return ;
    foe.despawnUncertainBullets(lastFrameTime); // later only despown bullet that
    foe._findStateInFrame(lastFrameIndex);
    // console.log('finding state in frame', JSON.stringify(foe.position));
    player.despawnUncertainBullets(lastFrameTime);
    player._findStateInFrame(lastFrameIndex);
    // foe.findStateAtTime(lastFrameTime);
    // foe.actions.clear();
    let startFrameIndex = lastFrameIndex;
    // console.log(`from frame: ${lastFrameIndex} to frame: ${finalFrameIndex}`);
    while (lastFrameIndex !== finalFrameIndex) {
        let nextFrameTime = gClock.getFrameTime(lastFrameIndex + 1);
        // console.log(`current frame time ${lastFrameTime} next frame time: ${nextFrameTime}`);
        // if (lastFrameIndex === finalFrameIndex) {
        //     if (type === "slow") {
        //         // console.log('slow roll back back off');
        //         break ;
        //     }
        //     nextFrameTime = gClock.getLastRanderTime();
        // }
        // console.log(`rolling back from ${lastFrameTime} to ${nextFrameTime}`);
        let lastActionTime = lastFrameTime;
        const frameSpan = nextFrameTime - lastFrameTime;
        if (lastFrameIndex !== startFrameIndex)
            foe.savePlayerData(lastFrameIndex);
        player.restoreFrameInput(lastFrameIndex);
        player.savePlayerData(lastFrameIndex);
        // player._findPositonInFrame(lastFrameIndex);// underscore methods are unsafe
        // player.savePlayerData(lastFrameIndex);
        // if (type === "slow")
        // foe.savePlayerData(lastFrameIndex + 1);
        // else
        //     foe.savePlayerData(lastFrameIndex + 1);
        if (connection.hasRecievedData() && lastFrameTime < actionTime) {
            foe.rollBack(recievedData, lastFrameTime, actionTime, lastFrameIndex);
            lastActionTime = actionTime;
            // console.log('after rolling back: ', foe.position);
            connection.next();
            // console.log('next received data order ', connection.recievedDataOrder);
        }
        while (connection.hasRecievedData()) {
            // console.log('new data');
            recievedData = connection.getRecievedDataOrdered();
            let newActionTime = Inputs.findTimeStamp(recievedData);
            if (newActionTime >= nextFrameTime)
                break;
            // console.log('new data:  start handling')
            foe.rollbackNextAction(recievedData, lastActionTime, newActionTime);
            foe.saveRollBackData(lastFrameIndex);
            // console.log('after rolling back: ', foe.position);
            lastActionTime = newActionTime;
            connection.next();
            // console.log('next received data order ', connection.recievedDataOrder);
            // console.log('new data:  done handling')
        }
        if (lastActionTime < nextFrameTime) {
            // console.log('fninishing action from time: ', lastActionTime, " to: ", nextFrameTime);
            let timeS = nextFrameTime - lastActionTime;
            foe.saveRollBackData(lastFrameIndex);
            // if (type === "slow")
            //     foe.saveRollBackData(lastFrameIndex);
            // else
            //     foe.saveRollBackData(lastFrameIndex + 1);
            // console.log('before frame update: ', JSON.stringify(foe.position));
            foe.update(timeS, lastActionTime, 0);
            // console.log('finish frame update: ', JSON.stringify(foe.position));
            // console.log("foe move vect ", JSON.stringify(foe.movementVector));
            // console.log(`after finishing action at time : ${nextFrameTime} position: ${JSON.stringify(foe.position)}`);
        }
        player.update(frameSpan, lastFrameTime, 0);
        turretBulletM.findPositionAtTime(lastFrameTime);
        playerBulletM.findPositionAtTime(lastFrameTime);
        foeBulletM.findPositionAtTime(lastFrameTime);
        turretBulletM.checkRollbackCollision(player, frameSpan, lastFrameTime);
        turretBulletM.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        playerBulletM.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        foeBulletM.checkRollbackCollision(player, frameSpan, lastFrameTime);
        lastFrameTime = nextFrameTime;
        lastFrameIndex++;
        if (lastFrameIndex >= 60)
            lastFrameIndex = 0;
    }
    // let lastRanderTime = gClock.getLastRanderTime();
    // let finalFrameTime = gClock.getFrameTime(finalFrameIndex);
    // if (lastRanderTime > finalFrameTime) {
    //     foe.
    // }
    turretBulletM.batchUndestroyBullet();
    turretBulletM.batchUndestroyBullet();
    playerBulletM.batchUndestroyBullet();
    foeBulletM.batchUndestroyBullet();
    // console.log('roll back time: ', new Date().valueOf() - startTime - currentTime);
    justRolledBack = true;
    // console.log("_______________________________________");
}
var animate = (span, timeStamp) => {
    // labelRenderer.render( scene, camera );
    let frameIndex = gClock.getFrameIndex(timeStamp);
    handleInputs(span, timeStamp);
    let startTime = gClock.startTime;
    // if (justRolledBack) {
    //     // justRolledBack = false;
    //     let lastFrame = gClock.getFrameTime(frameIndex - 1);
    //     let span = timeStamp - lastFrame;
    //     // console.log('just rolled back at time: ', timeStamp, ' span: ', span);
    //     // console.log('(just rolled back) before animete at time', lastFrame, ' postion: ', foe.position);
    //     foe.update(span, lastFrame, lastFrame);
    //     console.log('after just rolling back: ', JSON.stringify(foe.position));
    //     console.log("foe move vect ", JSON.stringify(foe.movementVector));
    //     // console.log('(just rolled back) before animete at time', timeStamp, ' postion: ', foe.position);
    // }
    player.savePlayerData(frameIndex);
    player.update(span, timeStamp, timeStamp);
    playerBulletM.update(timeStamp);
    if (keyControls.checkforNewInputs()) {
        // console.log('new inputs handled');
        // console.log("player pos", JSON.stringify(player.oldPosition));
        // console.log("player move vect ", JSON.stringify(player.movementVector));
        // console.log("plane vector: ", JSON.stringify(foe.planeFacingVector));
        keyControls.setAsHandeled();
    }
    foe.savePlayerData(frameIndex);
    foe.update(span, timeStamp, timeStamp);
    foeBulletM.update(timeStamp);
    let beat = musicSyncer.findCurrentBeat();
    // if (beat)
    //     turret.sync(beat);
    // turretBulletM.update(timeStamp);
    if (justRolledBack) {
        // console.log('(just rolled back) after animete at time', timeStamp + span, ' postion: ', foe.position);
        // console.log("plane vector: ", JSON.stringify(foe.planeFacingVector));
        justRolledBack = false;
    }
    turretBulletM.checkCollision(player, span, timeStamp);
    turretBulletM.checkCollision(foe, span, timeStamp);
    playerBulletM.checkCollision(foe, span, timeStamp);
    foeBulletM.checkCollision(player, span, timeStamp);
    // turretBulletManager.checkCollision(foe, span);
    // playerBulletManager.checkCollision(foe, span);
    // foeBulletManager.checkCollision(player, span);
    // console.log("player pos", player.position, "foe pos", foe.position);
};
function handleInputs(span, inputTimeStamp) {
    // let recievedData = connection.getRecievedDataOrdered();
    // if (recievedData) {
    //     player.inputs.deserialize(recievedData);
    //     return ;
    // }
    if (!keyControls.checkforNewInputs())
        return;
    // keyControls.setAsHandeled();
    let playerPosition = player.position;
    let { angle, direction } = keyControls.findPlayerAngle(playerPosition);
    let move = keyControls.findPlayerMove();
    let action = keyControls.findPlayerAction();
    if (action.d) {
        connection.signalStart();
        // startGame(new Date().valueOf() + 1000);
        // connection.send(JSON.stringify({start: true}));
    }
    let inputs = player.inputs.set(move, angle, direction, action, inputTimeStamp);
    let data = inputs.serializeForSend();
    // setTimeout(()=> {                    
    //     // console.log('-sent data: ', data);
    // }, 100);
    connection.send(JSON.stringify(data));
    // console.log('+sent data: ', data);
}
;
function startGame(timeStamp) {
    console.log('starting game in: ', timeStamp - new Date().valueOf());
    musicSyncer.stopMusic();
    turretBulletM.reset();
    playerBulletM.reset();
    player.reset();
    foe.reset();
    connection.reset();
    UIRander.count(3);
    setTimeout(() => {
        UIRander.count(2);
    }, 1000);
    setTimeout(() => {
        UIRander.count(1);
    }, 2000);
    setTimeout(() => {
        UIRander.count(0);
    }, 3000);
    setTimeout(() => {
        gClock.start();
        // while(timeStamp > new Date().valueOf());
        gClock.setStartTime(musicSyncer.playMusic());
        gClock.frameCount = 0;
        turretBulletM.reset();
        playerBulletM.reset();
        player.reset();
        foe.reset();
        turret.reset();
        connection.reset();
    }, (timeStamp - new Date().valueOf()));
}
function stopRoutine() {
    gClock.stop();
    if (player.health === foe.health) {
        connection.signalStart();
        return;
    }
    let winner = player.health > foe.health ? user : player2;
    console.log('game ended');
    console.log('winner: ', winner.id);
    connection.send(JSON.stringify({ sync: "end", winner: winner.id }));
    // musicSyncer.stopMusic();
    // connection.sendGameEndToServer(gameData, winner.id);
}
function signalEndGame(timeStamp) {
    if (timeStamp < connection.getLastReceiveTime() || connection.gameEnded === true) {
        stopRoutine();
    }
    else
        setTimeout(() => {
            stopRoutine();
        }, 100);
}
function setPlaneVector(camera, player, foe) {
    const planeFacingVector = getCameraDir(camera);
    player.setPlaneVector(planeFacingVector);
    foe.setPlaneVector(planeFacingVector);
}
gClock.loop(animate, rollBack);
gClock.render();
gClock.setStartTime(musicSyncer.startTime);
