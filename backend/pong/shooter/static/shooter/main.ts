import * as THREE from 'three';
import { initPlane, PlayersBulletManager, TurretBulletManager, Turret } from './assets.js';
import { Player } from './player.js';
import { KeyControls, getCameraDir } from './keyControls.js';
import { gameClock } from './gclock.js';
import { MusicSync } from './sync.js';
import { musicMap } from './assets/reolMap.js';
import { Connection } from './connection.js';

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

let foe = user.id === users[0].id ? users[1] : users[0];
console.log('user: ', user, ' foe: ', foe);

const { scene, camera, renderer } = initThreeJS();
const keyControls = new KeyControls(camera);
const gClock = new gameClock(scene, camera, renderer);
const connection = new Connection();
connection.init(foe.id);
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

const planeFacingVector = getCameraDir(camera);
player.setPlaneVector(planeFacingVector);

var rollBack = (startTime) => {}

var animate = (s: number, timeStamp: number) => {
    let startTime = gClock.startTime;
    // if (justRolledBack) {
    //     let lastFrame = gClock.getFrameTime(0);
    //     let span = timeStamp - lastFrame;
    //     // console.log('just rolled back at time: ', timeStamp, ' span: ', span);
    //     // console.log('(just rolled back) before animete at time', lastFrame, ' postion: ', foe.position);
    //     foe.update(span, planeFacingVector, lastFrame, lastFrame);
    //     // console.log('(just rolled back) before animete at time', timeStamp, ' postion: ', foe.position);
    // }

    player.update(s, timeStamp, timeStamp);
    playerBulletM.update(timeStamp);
    // foe.update(s, planeFacingVector, timeStamp, timeStamp);

    let beat = musicSyncer.findCurrentBeat();
    if (beat)
        turret.sync(beat);
    turretBulletM.update(timeStamp);


    // if (justRolledBack) {
    //     // console.log('(just rolled back) after animete at time', timeStamp + s, ' postion: ', foe.position);
    //     justRolledBack = false;
    // }


    turretBulletM.checkCollision(player, s);
    // turretBulletManager.checkCollision(foe, s);
    // playerBulletManager.checkCollision(foe, s);
    // foeBulletManager.checkCollision(player, s);
}

function handleInputs(s: number, timeStamp: number) {
    let playerPosition = player.position;
    let {angle, direction} = keyControls.findPlayerAngle(playerPosition)
    let move = keyControls.findPlayerMove();
    let action = keyControls.findPlayerAction();
    if (action.d) {
        connection.send("hello");
        startGame(performance.now() + 1000);
    }

    let inputs = player.inputs.set(move, angle,
                    direction, action, timeStamp);
};

function startGame(timeStamp) {
    console.log('starting game in: ', timeStamp - performance.now());
        musicSyncer.stopMusic();
        turretBulletM.reset();
        playerBulletM.reset();
    setTimeout(() => {
        // while(timeStamp > performance.now());
        gClock.setStartTime(musicSyncer.playMusic());
        gClock.frameCount = 0;
        turretBulletM.reset();
        playerBulletM.reset();
        player.reset();
        turret.reset();
    }, (timeStamp - performance.now()));
}

function setPlaneVector(camera: THREE.Camera, player: Player, foe: Player) {
    const planeFacingVector = getCameraDir(camera);
    player.setPlaneVector(planeFacingVector);
    foe.setPlaneVector(planeFacingVector);
}

gClock.loop(animate, rollBack, handleInputs);
// gClock.setStartTime(musicSyncer.playMusic());
gClock.setStartTime(musicSyncer.startTime);

// const connection = new Connection(keyControls, playerSyncData);
// connection.connectToServer(friend.id);
// connection.attatchGameStart(startGame);


