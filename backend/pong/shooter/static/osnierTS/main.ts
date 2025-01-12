import * as THREE from 'three';
import { initPlane, Player } from './assets';
import { KeyControls, getCameraDir } from './keyControls';
import { gameClock } from './gclock';

function initThreeJS(): { scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer } {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0, 150, 0);
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

const { scene, camera, renderer } = initThreeJS();
const keyControls = new KeyControls(camera);
const gClock = new gameClock(scene, camera, renderer);

const plane = initPlane();
scene.add(plane);

const planeFacingVector = getCameraDir(camera);

const player = new Player(new THREE.Vector3(0, 0, 0));
player.setPlaneVector(planeFacingVector);
player.addToScene(scene);
player.add(camera);

var rollBack = (startTime) => {}

var animate = (s, timeStamp) => {
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
    // foe.update(s, planeFacingVector, timeStamp, timeStamp);

    // if (justRolledBack) {
    //     // console.log('(just rolled back) after animete at time', timeStamp + s, ' postion: ', foe.position);
    //     justRolledBack = false;
    // }

    // turretBulletManager.update(timeStamp);
    // playerBulletManager.update(timeStamp);
    // foeBulletManager.update(timeStamp);

    // if (limit > 5) {
    //     limit = 0;
    //     scale = 1;
    // }

    // let beat = musicSyncer.findCurrentBeat();

    // let listen = true;
    // if (listen && beat && beat.type && !beat.handled) {
    //     beat.handled = true;
    //     // console.log('beat: ', beat);
    //     // console.log(new Date().valueOf() - startTime);
    //     limit = 0;
    //     scale = 1.2;
    //     turret.update(beat.time, startTime);

    //     switch (beat.type) {
    //         case 1:
    //             turret.fire(0xfc7703);
    //             break;
    //         case 2:
    //             turret.fire(0xff0000);
    //             turret.fireAtAngle(0xff0000, Math.PI / 8);
    //             turret.fireAtAngle(0xff0000, 2 * Math.PI / 8);
    //             turret.fireAtAngle(0xff0000, 3 * Math.PI / 8);
    //             break;
    //     }
    // }

    // turret.scale.set(scale, scale, scale)
    
    // limit++;

    // turretBulletManager.checkCollision(player, s);
    // turretBulletManager.checkCollision(foe, s);
    // playerBulletManager.checkCollision(foe, s);
    // foeBulletManager.checkCollision(player, s);
}

function handleInputs(s, timeStamp) {
    let playerPosition = player.position;
    let {angle, direction} = keyControls.findPlayerAngle(playerPosition)
    let move = keyControls.findPlayerMove();
    let action = keyControls.findPlayerAction();

    let inputs = player.inputs.set(move, angle,
                    direction, action, timeStamp);
};

function setPlaneVector(camera, player, foe) {
    const planeFacingVector = getCameraDir(camera);
    player.setPlaneVector(planeFacingVector);
    foe.setPlaneVector(planeFacingVector);
}

gClock.loop(animate, rollBack, handleInputs);

// const connection = new Connection(keyControls, playerSyncData);
// connection.connectToServer(friend.id);
// connection.attatchGameStart(startGame);


