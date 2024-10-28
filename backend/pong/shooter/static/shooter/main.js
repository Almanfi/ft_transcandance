import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { KeyControls, PlayerData, getCameraDir } from './keyControl.js';
import { gameClock } from './gclock.js';
import { Turret, Player } from './assets.js';
import { MusicSync } from './sound.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio * 1);

document.body.appendChild( renderer.domElement );

var playerData = new PlayerData();

// var move = { 
//     up: false,
//     down: false,
//     left: false,
//     right: false
// };


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
scene.add( light );

let limit1 = 0;
let limit2 = 0;
var playerSyncData = new PlayerData();

var animate = (s) => {
    const planeFacingVector = getCameraDir(camera);

    

    player.update(s, keyControls, planeFacingVector);
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
    // if (limit2 > 100) {
    //     limit2 = 0;
    // if (socket && document.getElementById('reciever').value != '')
    //     sendPlayerData({position: player.position});

    //     if (socket && socket.recieverId != '')
    //         sendPosition(player.position);
    // }
    // limit2++;
    limit1++;

    if (playerSyncData.position) {
        console.log('pos: ', playerSyncData.position);
        player.position.set(playerSyncData.position.x, playerSyncData.position.y, playerSyncData.position.z);
        playerSyncData.position = null;
    }
    else {
        // if (playerSyncData.move.up)
        //     player.move(s, 'up', planeFacingVector);
        // if (playerSyncData.move.left)
        //     player.move(s, 'left', planeFacingVector);
        // if (playerSyncData.move.down)
        //     player.move(s, 'down', planeFacingVector);
        // if (playerSyncData.move.right)
        //     player.move(s, 'right', planeFacingVector);
    }

    player.move(s, playerSyncData.move, planeFacingVector);
    // if (playerSyncData?.position) {
    //     player.position.x = playerSyncData.position.x;
    //     player.position.z = playerSyncData.position.z;
    // }
    // if (keyControls.Wkey.hold)
    //     sendMove('up');
    // if (keyControls.Akey.hold)
    //     sendMove('left');
    // if (keyControls.Skey.hold)
    //     sendMove('down');
    // if (keyControls.Dkey.hold)
    //     sendMove('right');

}

gClock.loop(animate);

var webRTC = null;
let pingInterval;
let pingStartTime;

const iceConfiguration = {
    iceServers: [
    ],
}
// { urls: "stun:stun.l.google.com:19302" }



var socket;
document.getElementById('msgSender').addEventListener('click', send);
document.getElementById('connector').addEventListener('click', connect);
function connect() {
    console.log('connecting');
    socket = new WebSocket('wss://' + window.location.host + '/ws/roll/');
    document.getElementById('socketStatus').innerHTML = 'Connected';
    let reciever = document.getElementById('reciever').value;
    keyControls.attachSocket(socket, reciever);
    socket.recieverId = reciever;
    socket.onopen = function(e) {
        console.log('open', e);
    };
    socket.onmessage = async function(e) {
        let data = JSON.parse(e.data).message;
        console.log(e.data);
        if (JSON.parse(e.data).status == "sent")
            return;
        if (data.offer) {
            console.log('recieved offer');
            webRTC = { };
            
            const remoteConnection = new RTCPeerConnection(iceConfiguration);

            remoteConnection.onicecandidate = e =>  {
                if (e.candidate) {
                    console.log("New ICE candidate: ", e.candidate);
                    sendPlayerData({ iceCandidate: e.candidate });
                }

                if (iceCount === 1) {
                    console.log('Sending answer: ', remoteConnection.localDescription);
                    sendPlayerData({ answer: remoteConnection.localDescription });
                    webRTC.remoteConnection = remoteConnection;
                    webRTC.sendChannel = null;
                }
                iceCount++;
                // console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
                // console.log(JSON.stringify(remoteConnection.localDescription) )
                // if (iceCount === 0) {
                //     console.log('sending answer: ', remoteConnection.localDescription);
                //     sendPlayerData({answer: remoteConnection.localDescription});
                //     webRTC.remoteConnection = remoteConnection;
                //     webRTC.sendChannel = null;
                // }
                // iceCount++;
            }

            remoteConnection.onicecandidateerror = (event) => {
                console.error(`ICE Candidate Error: ${event.errorText} (Code: ${event.errorCode})`);
                console.error(`URL: ${event.url}`);
                console.error(`Address: ${event.address}`);
                console.error(`Port: ${event.port}`);
                console.error(`Host Candidate: ${event.hostCandidate}`);
            };


            remoteConnection.ondatachannel= e => {

            const receiveChannel = e.channel;
            receiveChannel.onmessage = e =>  {
                let data = JSON.parse(e.data);
                if (data.type === "ping") {
                    // Respond to ping
                    sendRTC(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
                } else if (data.type === "pong") {
                    // Calculate ping
                    let pingEndTime = performance.now();
                    let latency = pingEndTime - data.timestamp;
                    console.log(`Ping: ${latency.toFixed(2)} ms`);
                }
                if (data.move)
                    playerSyncData.move = Object.assign(playerSyncData.move, data.move);
                if (data.position) {
                    console.log('recieved position');
                    playerSyncData.position = data.position;
                }
                else
                    playerSyncData.position = null;
            }
            receiveChannel.onopen = e => {
                console.log("open!!!!");
                keyControls.webRTC = webRTC;
                startPing();
            }
            receiveChannel.onclose =e => {
                console.log("closed!!!!!!");
                keyControls.webRTC = null;
                stopPing();
            }
            remoteConnection.channel = receiveChannel;

            }


            remoteConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(a=>console.log("done"))
            .catch(error => {
                console.error("Error setting offer: ", error);
            });

            //create answer
            await remoteConnection.createAnswer().then(a => remoteConnection.setLocalDescription(a)).then(a=> {
                // console.log('Sending answer: ', remoteConnection.localDescription);
                // sendPlayerData({ answer: remoteConnection.localDescription });
                // // // console.log(JSON.stringify(remoteConnection.localDescription))
                // // console.log('sending answer');
                // // console.log({answer: remoteConnection.localDescription});
                // // // sendPlayerData({answer: remoteConnection.localDescription});
                // webRTC.remoteConnection = remoteConnection;
                // webRTC.sendChannel = null;
                // // console.log("remte channel is : ", webRTC.remoteConnection)
            })

            return ;
        }
        if (data.answer) {
            console.log('recieved answer');
            webRTC.localConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
            .then(a=>console.log("done"));
            return;
        }
        else if (data.iceCandidate) {
            console.log('recieved ice candidate');
            if (webRTC.remoteConnection)
                webRTC.remoteConnection.addIceCandidate(new RTCSessionDescription(data.answer));
            else if (webRTC.localConnection)
                webRTC.localConnection.addIceCandidate(new RTCSessionDescription(data.answer));
            return ;
        }
        if (!JSON.parse(e.data).from)
            return;
        if (data.move)
            playerSyncData.move = Object.assign(playerSyncData.move, data.move);
        if (data.position) {
            console.log('recieved position');
            playerSyncData.position = data.position;
        }
        else 
            playerSyncData.position = null;

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

function sendPlayerData(playerData) {
    let data = {
        "type": "chat.message",
        "friend_id": document.getElementById('reciever').value,
        "message": playerData
    };
    socket.send(JSON.stringify(data));
}

function sendPosition(position) {
    let data = {
        "type": "chat.message",
        "friend_id": socket.recieverId,
        "message": {
            "position": position
        }
    };
    console.log(data);
    if (socket)
        socket.send(JSON.stringify(data));
}







document.getElementById('RTCconnect').addEventListener('click', createRTCoffer);
document.getElementById('RTCsender').addEventListener('click', sendRTCmessage);


function sendRTCmessage() {
    let msg = document.getElementById('RTCweb')?.value;
    console.log('sending message: ', msg);
    if (webRTC.sendChannel)
        webRTC.sendChannel.send(msg);
    else
        webRTC.remoteConnection.channel.send(msg)
}
function sendRTC(msg) {
    if (webRTC.sendChannel)
        webRTC.sendChannel.send(msg);
    else
        webRTC.remoteConnection.channel.send(msg)
}

let iceCount = 0;

function createRTCoffer() {
    webRTC = { };
    const localConnection = new RTCPeerConnection(iceConfiguration);
    
    localConnection.onicecandidate = e =>  {
        if (e.candidate) {
            console.log("New ICE candidate: ", e.candidate);
            sendPlayerData({ iceCandidate: e.candidate });
        }
        
        // console.log("NEW ice candidate!! on localconnection reprinting SDP ")
        // console.log(JSON.stringify(localConnection.localDescription))
        // if (iceCount === 0) {
        //     console.log('sending offer: ', localConnection.localDescription);
        //     sendPlayerData({offer: localConnection.localDescription});
        //     webRTC.localConnection = localConnection;
        //     webRTC.sendChannel = sendChannel;
        // }
        // iceCount++;

        if (iceCount === 1) {
            console.log("Sending offer: ", localConnection.localDescription);
            sendPlayerData({ offer: localConnection.localDescription });
            webRTC.localConnection = localConnection;
            webRTC.sendChannel = sendChannel;
        }
        iceCount++;
        
        
    }

    localConnection.onicecandidateerror = (event) => {
        console.error(`ICE Candidate Error: ${event.errorText} (Code: ${event.errorCode})`);
        console.error(`URL: ${event.url}`);
        console.error(`Address: ${event.address}`);
        console.error(`Port: ${event.port}`);
        console.error(`Host Candidate: ${event.hostCandidate}`);
    };
    

    const sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onmessage = e => {
        let data = JSON.parse(e.data);
        if (data.type === "ping") {
            // Respond to ping
            sendRTC(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
        } else if (data.type === "pong") {
            // Calculate ping
            let pingEndTime = performance.now();
            let latency = pingEndTime - data.timestamp;
            console.log(`Ping: ${latency.toFixed(2)} ms`);
        }
        if (data.move)
            playerSyncData.move = Object.assign(playerSyncData.move, data.move);
        if (data.position) {
            console.log('recieved position');
            playerSyncData.position = data.position;
        }
        else 
            playerSyncData.position = null;
    }
    sendChannel.onopen = e => {
        console.log("open!!!!");
        keyControls.webRTC = webRTC;
        startPing();
    }
    sendChannel.onclose = e => {
        console.log("closed!!!!!!");
        keyControls.webRTC = null;
        stopPing();
    }
    

    localConnection.createOffer().then(o => {return localConnection.setLocalDescription(o)} )
    .then(() => {
        // console.log("Sending offer: ", localConnection.localDescription);
        // sendPlayerData({ offer: localConnection.localDescription });
        // webRTC.localConnection = localConnection;
        // webRTC.sendChannel = sendChannel;
        
    }).catch(error => {
        console.error("Error creating offer: ", error);
    });
    // .then(() => {
    //     // console.log("offer is : ", localConnection.localDescription)
    //     // // sendPlayerData({offer: localConnection.localDescription}); 
    //     // console.log('sending offer');
    //     // webRTC.localConnection = localConnection;
    //     // webRTC.sendChannel = sendChannel;
    //     // console.log("sned channel is : ", webRTC.sendChannel)
    // })

    // sendPlayerData({offer: localConnection.localDescription});

    return webRTC;
}

function startPing() {
    pingInterval = setInterval(() => {
        pingStartTime = performance.now();
        sendRTC(JSON.stringify({ type: "ping", timestamp: pingStartTime }));
    }, 1000); // Ping every second
}

function stopPing() {
    clearInterval(pingInterval);
}