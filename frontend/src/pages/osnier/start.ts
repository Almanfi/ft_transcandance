// @ts-ignore
// @ts-nocheck

import * as THREE from './three/three.module.js';
import { Plane, PlayersBulletManager, TurretBulletManager, Turret } from './assets.js';
import { Player, Inputs } from './player.js';
import { KeyControls, getCameraDir } from './keyControls.js';
import { gameClock } from './gclock.js';
import { MusicSync } from './sync.js';
import { musicMap } from './assets/reolMap.js';
import { Connection } from './connection.js';
import { dataSaved } from './rollback.js';
import { UIRanderer } from './UIRanderer.js';
import { getGame, getUser } from './utils.js';
import Ura from 'ura';

// import { CSS2DObject, CSS2DRenderer } from './node_modules/three/examples/jsm/renderers/CSS2DRenderer.js';

function initThreeJS(gameConvas: HTMLElement): { scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer } {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200000 );
    // camera.position.set(0, 100000, 0);
    camera.position.set(20, 100000, -10);
    camera.lookAt(0,0,0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio * 1);

    let Convas =  gameConvas.appendChild( renderer.domElement );

    const light = new THREE.AmbientLight( 0xffffff );
    light.intensity = 0.5;
    scene.add( light );

    const light2 = new THREE.DirectionalLight( 0xffffff, 10);
    light2.position.set(10, 10, 10);
    light2.lookAt(0, 0, 0);
    scene.add( light2 );

    return { scene, camera, renderer};
}

export function startGame(user, gameData) {

    let users = [gameData.team_a[0], gameData.team_b[0]];
    let player2 = user.id === users[0].id ? users[1] : users[0];

    let playersPos = [new THREE.Vector3(12000, 0, 0), new THREE.Vector3(-12000, 0, 0)];
    if (user.id === users[1].id)
        playersPos = [new THREE.Vector3(-12000, 0, 0), new THREE.Vector3(12000, 0, 0)];

    const gameConvas = document.getElementById('osnier') as HTMLElement;
    const { scene, camera, renderer } = initThreeJS(gameConvas);
    const UIRander = new UIRanderer(gameConvas);
    UIRander.loadPlayer1Text(user.display_name);
    UIRander.loadPlayer2Text(player2.display_name);
    UIRander.loadPlayer1Image("./assets/image.png");
    UIRander.loadPlayer2Image("./assets/image.png")
    UIRander.loadCounter();
    UIRander.render();
    const keyControls = new KeyControls(camera, gameConvas);
    window.addEventListener('resize', () => {
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
    connection.setType(user, gameData);
    connection.init(player2.id);
    connection.attatchGameStart(startGame);
    const musicSyncer = new MusicSync(camera);
    musicSyncer.loadMusic('./assets/No_title.mp3');
    musicSyncer.addMusicMap(musicMap);
    const bulletSound = musicSyncer.loadNewSound('./assets/a6.mp3');

    const plane = new Plane();
    scene.add(plane);


    const turretBulletM = new TurretBulletManager(scene);
    const turret = new Turret(turretBulletM, {initPosition: new THREE.Vector3(15, 0, 0)});
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

    function rollBack(startTime: number, type: string) {
        if (frameError > 5)
            return ;
        let currentTime = new Date().valueOf() - startTime;

        if (connection.hasRecievedData() === false)
            return ;
        let recievedData = connection.getRecievedDataOrdered();
        let actionTime = Inputs.findTimeStamp(recievedData as string);
        if (currentTime < actionTime) // back to the future!
        return;

        let finalFrameIndex = gClock.getFrameIndex(currentTime);
        let lastFrameIndex = gClock.getFrameIndex(actionTime);
        if (lastFrameIndex < 0) {
            frameError++;
            return ;
        }
        if (lastFrameIndex === finalFrameIndex)
            return ;
        let lastFrameTime = gClock.getFrameTime(lastFrameIndex);

        foe.despawnUncertainBullets(lastFrameTime);
        foe._findStateInFrame(lastFrameIndex);

        player.despawnUncertainBullets(lastFrameTime);
        player._findStateInFrame(lastFrameIndex);
        let startFrameIndex = lastFrameIndex;
        while (lastFrameIndex !== finalFrameIndex) {
            let nextFrameTime = gClock.getFrameTime(lastFrameIndex + 1);
            let lastActionTime = lastFrameTime;
            const frameSpan = nextFrameTime - lastFrameTime;
            if (lastFrameIndex !== startFrameIndex)
                foe.savePlayerData(lastFrameIndex);
            player.restoreFrameInput(lastFrameIndex);
            player.savePlayerData(lastFrameIndex);
            if (connection.hasRecievedData() && lastFrameTime < actionTime) {
                foe.rollBack(recievedData as string, lastFrameTime, actionTime, lastFrameIndex);
                lastActionTime = actionTime;
                connection.next();
            }

            while (connection.hasRecievedData()) {
                recievedData = connection.getRecievedDataOrdered() as string;
                let newActionTime = Inputs.findTimeStamp(recievedData);
                if (newActionTime >= nextFrameTime)
                    break;
                foe.rollbackNextAction(recievedData, lastActionTime, newActionTime);
                foe.saveRollBackData(lastFrameIndex);
                lastActionTime = newActionTime;
                connection.next();
            }
            if (lastActionTime < nextFrameTime) {
                let timeS = nextFrameTime - lastActionTime;
                foe.saveRollBackData(lastFrameIndex);
                foe.update(timeS, lastActionTime, 0);
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

        turretBulletM.batchUndestroyBullet();
        turretBulletM.batchUndestroyBullet();
        playerBulletM.batchUndestroyBullet();
        foeBulletM.batchUndestroyBullet();
        justRolledBack = true;
    }

    var animate = (span: number, timeStamp: number) => {
        let frameIndex = gClock.getFrameIndex(timeStamp);
        handleInputs(span, timeStamp);
        let startTime = gClock.startTime;

        player.savePlayerData(frameIndex);
        player.update(span, timeStamp, timeStamp);
        playerBulletM.update(timeStamp);

        if (keyControls.checkforNewInputs()) {
            keyControls.setAsHandeled();
        }

        foe.savePlayerData(frameIndex);
        foe.update(span, timeStamp, timeStamp);
        foeBulletM.update(timeStamp);

        let beat = musicSyncer.findCurrentBeat();
        if (beat)
            turret.sync(beat);
        turretBulletM.update(timeStamp);


        if (justRolledBack) {
            justRolledBack = false;
        }


        turretBulletM.checkCollision(player, span, timeStamp);
        turretBulletM.checkCollision(foe, span, timeStamp);
        playerBulletM.checkCollision(foe, span, timeStamp);
        foeBulletM.checkCollision(player, span, timeStamp);
    }

    function handleInputs(span: number, inputTimeStamp: number) {
        if (!keyControls.checkforNewInputs())
            return ;
        let playerPosition = player.position;
        let {angle, direction} = keyControls.findPlayerAngle(playerPosition)
        let move = keyControls.findPlayerMove();
        let action = keyControls.findPlayerAction();

        let inputs = player.inputs.set(move, angle,
                        direction, action, inputTimeStamp);
        let data = inputs.serializeForSend();
        connection.send(JSON.stringify(data));
    };

    function startGame(timeStamp) {
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
            return ;
        }
        let winner = player.health > foe.health ? user : player2;
        connection.send(JSON.stringify({sync: "end", winner: winner.id}));
        let score = winner.id === user.id ? true : false;
        connection.sendGameEndToServer(gameData.id, score);
        if (gameData.type === "tournament" && gameData.tournament_phase === "semis" && score) {
          Ura.navigate(`/game?name=osnier&tournament_id=${gameData.tournament.id}`);
        }
        else
          Ura.navigate("/game?name=osnier");
    }

    function signalEndGame(timeStamp: number) {
        if (timeStamp < connection.getLastReceiveTime() || connection.gameEnded === true) {
            stopRoutine();
        }
        else setTimeout(() => {
            stopRoutine();
        }, 100);
    }

    function setPlaneVector(camera: THREE.Camera, player: Player, foe: Player) {
        const planeFacingVector = getCameraDir(camera);
        player.setPlaneVector(planeFacingVector);
        foe.setPlaneVector(planeFacingVector);
    }

    gClock.loop(animate, rollBack);
    gClock.render();
    gClock.setStartTime(musicSyncer.startTime);
}