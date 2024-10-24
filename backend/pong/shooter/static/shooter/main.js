import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { KeyControls, getCameraDir } from './keyControl.js';
import { gameClock } from './gclock.js';
import { Turret, Player } from './assets.js';
import { MusicSync } from './sound.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio * 1);

document.body.appendChild( renderer.domElement );

const keyControls = new KeyControls();
const gClock = new gameClock(scene, camera, renderer);

const musicSyncer = new MusicSync(camera);
musicSyncer.loadMusic('/static/shooter/assets/8bit_Weight_World.mp3');
musicSyncer.bullet = musicSyncer.loadNewSound('/static/shooter/assets/a6.mp3');


const geometry = new THREE.PlaneGeometry( 400, 300 );
const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
scene.add( plane );
plane.receiveShadow = true;
plane.position.x = 0;
plane.position.y = 0;
plane.position.z = 0;
plane.rotateX(Math.PI / 2);

const player = new Player({x: 0, y: 0, z: 0});

player.addToScene(scene);


camera.position.x = 50;
camera.position.y = 300;
camera.position.z = -30;

camera.lookAt(0,0,0);

var turret = new Turret({initPosition: {x: 10, y: 3, z: 10}, rotationSpeed: 0.1, speed: 1});
turret.addToScene(scene);

var bullets = new Map();


const light = new THREE.AmbientLight( 0xffffff ); // soft white light 
scene.add( light );

let limit1 = 0;

var animate = (ms) => {
    const planeFacingVector = getCameraDir(camera);

    player.update(keyControls, planeFacingVector);
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

    if (limit1 > 3) {
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
    limit1++;
    if (keyControls.Wkey.hold)
        sendMove('up');
    if (keyControls.Akey.hold)
        sendMove('left');
    if (keyControls.Skey.hold)
        sendMove('down');
    if (keyControls.Dkey.hold)
        sendMove('right');

}

gClock.loop(animate);

var socket;
document.getElementById('msgSender').addEventListener('click', send);
document.getElementById('connector').addEventListener('click', connect);
function connect() {
    console.log('connecting');
    socket = new WebSocket('wss://' + window.location.host + '/ws/roll/');
    socket.onopen = function(e) {
        console.log('open', e);
    };
    socket.onmessage = function(e) {
        let data = JSON.parse(e.data).message;
        console.log('message', data);
        switch (data.move) {
            case 'left':
                player.move('left', getCameraDir(camera));
                break;
            case 'right':
                player.move('right', getCameraDir(camera));
                break;
            case 'up':
                player.move('up', getCameraDir(camera));
                break;
            case 'down':
                player.move('down', getCameraDir(camera));
                break;
        }
    };
    socket.onclose = function(e) {
        console.log('close', e);
    };
    socket.onerror = function(e) {
        console.log('error', e);
    };
}

function send() {
    console.log('sending');
    let data = {
        "type": "chat.message",
        "friend_id": document.getElementById('reciever').value,
        "message": document.getElementById('message').value
    };
    socket.send(JSON.stringify(data));
}

function sendMove(move) {
    let data = {
        "type": "chat.message",
        "friend_id": document.getElementById('reciever').value,
        "message": {
            "move": move
        }
    };
    socket.send(JSON.stringify(data));
}
