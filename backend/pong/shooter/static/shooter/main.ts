import * as THREE from 'three';
import { initPlane, PlayersBulletManager, TurretBulletManager, Turret } from './assets.js';
import { Player, Inputs } from './player.js';
import { KeyControls, getCameraDir } from './keyControls.js';
import { gameClock } from './gclock.js';
import { MusicSync } from './sync.js';
import { musicMap } from './assets/reolMap.js';
import { Connection } from './connection.js';
import { dataSaved } from './rollback.js';
// import { CSS2DObject, CSS2DRenderer } from './node_modules/three/examples/jsm/renderers/CSS2DRenderer.js';

function initThreeJS(): { scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer } {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 50000 );
    camera.position.set(0, 10000, 0);
    // camera.position.set(20, 150, -10);
    camera.lookAt(0,0,0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio * 2);

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
connection.attatchGameStart(startGame);
const musicSyncer = new MusicSync(camera);
musicSyncer.loadMusic('/static/shooter/assets/No_title.mp3');
musicSyncer.addMusicMap(musicMap);
const bulletSound = musicSyncer.loadNewSound('/static/shooter/assets/a6.mp3');



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


const plane = initPlane();
scene.add(plane);


const turretBulletM = new TurretBulletManager(scene);
const turret = new Turret(turretBulletM, {initPosition: new THREE.Vector3(15, 0, 0)});
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

let frameError = 0;

function rollBack(startTime: number) {
    // while (true) {
    //     let recievedData1 = connection.getRecievedDataOrdered();
    //     if (!recievedData1)
    //         break;
    //     foe.inputs.deserialize(recievedData1);
    //     connection.next();
    // }
    // return ;
    if (frameError > 5)
        return ;
    let currentTime = new Date().valueOf() - startTime;

    if (connection.hasRecievedData() === false)
        return ;
    // console.log('received data order ', connection.recievedDataOrder);
    let recievedData = connection.getRecievedDataOrdered();
    console.log(`received ${connection.recievedDataOrder} data: `, recievedData);

    let actionTime = Inputs.findTimeStamp(recievedData as string);
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
        return ;
        throw Error("could not find the frame");
    }
    if (lastFrameIndex === finalFrameIndex)
        return ;
    // console.log('roll back from frame: ', lastFrameIndex, ' to: ', finalFrameIndex);
    let lastFrameTime = gClock.getFrameTime(lastFrameIndex);

    // return ;
    foe.despawnUncertainBullets(lastFrameTime);// later only despown bullet that
    foe._findStateInFrame(lastFrameIndex);
    // console.log('after finding state in frame: ', foe.position);
    // foe.findStateAtTime(lastFrameTime);
    // foe.actions.clear();

    while (lastFrameIndex !== finalFrameIndex) {
        let nextFrameTime = gClock.getFrameTime(lastFrameIndex + 1);
        // console.log(`rolling back from ${lastFrameTime} to ${nextFrameTime}`);
        const frameSpan = nextFrameTime - lastFrameTime;
        
        player._findPositonInFrame(lastFrameIndex);// underscore methods are unsafe
        
        foe.savePlayerData(lastFrameIndex);
        foe.rollBack(recievedData as string, lastFrameTime, actionTime, lastFrameIndex);
        // console.log('after rolling back: ', foe.position);
        connection.next();
        // console.log('next received data order ', connection.recievedDataOrder);

        let lastActionTime = actionTime;
        while (connection.hasRecievedData()) {
            // console.log('new data');
            recievedData = connection.getRecievedDataOrdered() as string;
            actionTime = Inputs.findTimeStamp(recievedData);
            if (actionTime >= nextFrameTime)
                break;
            // console.log('new data:  start handling')
            foe.saveRollBackData(lastFrameIndex);
            foe.rollbackNextAction(recievedData, lastActionTime, actionTime);
            // console.log('after rolling back: ', foe.position);
            lastActionTime = actionTime;
            connection.next();
            // console.log('next received data order ', connection.recievedDataOrder);
            // console.log('new data:  done handling')
        }
        if (lastActionTime < nextFrameTime) {
            // console.log('fninishing action from time: ', lastActionTime, " to: ", nextFrameTime);
            let timeS = nextFrameTime - lastActionTime;
            foe.saveRollBackData(lastFrameIndex);
            foe.update(timeS, lastActionTime, lastFrameTime);
            // console.log('finish frame update: ', JSON.stringify(foe.position));
            // console.log("foe move vect ", JSON.stringify(foe.movementVector));

            // console.log(`after finishing action at time : ${nextFrameTime} position: ${JSON.stringify(foe.position)}`);
        }
        foe.savePlayerData(lastFrameIndex)

        // turretBulletM.findPositionAtTime(lastFrameTime);
        // playerBulletM.findPositionAtTime(lastFrameTime);
        // foeBulletM.findPositionAtTime(lastFrameTime);

        // turretBulletM.checkRollbackCollision(player, frameSpan, lastFrameTime);
        // turretBulletM.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        // playerBulletM.checkRollbackCollision(foe, frameSpan, lastFrameTime);
        // foeBulletM.checkRollbackCollision(player, frameSpan, lastFrameTime);

        lastFrameTime = nextFrameTime;
        lastFrameIndex++;
        if (lastFrameIndex >= 60)
            lastFrameIndex = 0;
    }

    // turretBulletM.batchUndestroyBullet();
    // turretBulletM.batchUndestroyBullet();
    // playerBulletM.batchUndestroyBullet();
    // foeBulletM.batchUndestroyBullet();

    // console.log('roll back time: ', new Date().valueOf() - startTime - currentTime);
    justRolledBack = true;
    // console.log("_______________________________________");
}

var animate = (span: number, timeStamp: number) => {
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
        // console.log("player pos", JSON.stringify(player.oldPosition));
        // console.log("player move vect ", JSON.stringify(player.movementVector));
        // console.log("plane vector: ", JSON.stringify(foe.planeFacingVector));
        keyControls.setAsHandeled();
    }

    foe.savePlayerData(frameIndex);
    foe.update(span, timeStamp, timeStamp);
    foeBulletM.update(timeStamp);
    // foe.update(span, planeFacingVector, timeStamp, timeStamp);

    let beat = musicSyncer.findCurrentBeat();
    if (beat)
        turret.sync(beat);
    turretBulletM.update(timeStamp);


    if (justRolledBack) {
        // console.log('(just rolled back) after animete at time', timeStamp + span, ' postion: ', foe.position);
        // console.log("plane vector: ", JSON.stringify(foe.planeFacingVector));
        justRolledBack = false;
    }


    turretBulletM.checkCollision(player, span);
    turretBulletM.checkCollision(foe, span);
    // turretBulletManager.checkCollision(foe, span);
    // playerBulletManager.checkCollision(foe, span);
    // foeBulletManager.checkCollision(player, span);
    

    console.log("player pos", player.position, "foe pos", foe.position);
}

function handleInputs(span: number, inputTimeStamp: number) {
    // let recievedData = connection.getRecievedDataOrdered();
    // if (recievedData) {
    //     player.inputs.deserialize(recievedData);
    //     return ;
    // }
    
    if (!keyControls.checkforNewInputs())
        return ;
    // keyControls.setAsHandeled();

    let playerPosition = player.position;
    let {angle, direction} = keyControls.findPlayerAngle(playerPosition)
    let move = keyControls.findPlayerMove();
    let action = keyControls.findPlayerAction();
    if (action.d) {
        connection.signalStart();
        // startGame(new Date().valueOf() + 1000);
        // connection.send(JSON.stringify({start: true}));
    }

    let inputs = player.inputs.set(move, angle,
                    direction, action, inputTimeStamp);
    let data = inputs.serializeForSend();
    connection.send(JSON.stringify(data));
    // console.log('sent data: ', data);
};

function startGame(timeStamp) {
    console.log('starting game in: ', timeStamp - new Date().valueOf());
        musicSyncer.stopMusic();
        turretBulletM.reset();
        playerBulletM.reset();
        player.reset();
        foe.reset();
        connection.reset();
    setTimeout(() => {
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


