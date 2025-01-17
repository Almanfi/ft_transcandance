import * as THREE from 'three';
// import { FontLoader, TextGeometry } from 'three/addons';
import { FontLoader } from "./three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./three/examples/jsm/geometries/TextGeometry.js";
class HealthBar {
    bar;
    size;
    scene;
    camera;
    aspect;
    renderer;
    reversed;
    constructor(position, camera, scene, renderer, aspect = 1) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.aspect = aspect;
        this.bar = [];
        this.size = 10;
        this.reversed = false;
        this.createHealthBar(position);
    }
    createHealthBar(position) {
        let length = 5 * this.aspect;
        let width = 5;
        const geometry = new THREE.BoxGeometry(length, 1, width);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const healthBar = new THREE.Mesh(geometry, material);
        healthBar.position.copy(position);
        healthBar.position.y = 0;
        healthBar.position.x -= length / 2;
        this.bar.push(healthBar);
        for (let i = 1; i < 10; i++) {
            this.bar.push(healthBar.clone());
            this.bar[i].position.x += length * i;
            this.scene.add(this.bar[i]);
        }
        return this;
    }
    reverse() {
        this.reversed = !this.reversed;
    }
    update(percentage) {
        let index = Math.floor(percentage * 10);
        if (this.reversed) {
            for (let i = 0; i < index; i++) {
                this.bar[9 - i].visible = true;
            }
            for (let i = index; i < 10; i++) {
                this.bar[9 - i].visible = false;
            }
        }
        else {
            for (let i = 0; i < index; i++) {
                this.bar[i].visible = true;
            }
            for (let i = index; i < 10; i++) {
                this.bar[i].visible = false;
            }
        }
        this.renderer.render(this.scene, this.camera);
    }
}
export class UIRanderer {
    scene;
    camera;
    renderer;
    healthBars;
    aspect;
    textureLoader;
    constructor(gameConvas) {
        this.scene = new THREE.Scene();
        let height = gameConvas.getBoundingClientRect().height;
        let width = gameConvas.getBoundingClientRect().width;
        this.aspect = width / height;
        this.camera = new THREE.OrthographicCamera(-100 * this.aspect, 100 * this.aspect, 100, -100, 0.1, 1000);
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1);
        this.renderer.setClearColor(0x000000, 0);
        let UIConvas = gameConvas.appendChild(this.renderer.domElement);
        UIConvas.style.position = 'absolute';
        UIConvas.style.top = '0px';
        UIConvas.style.left = '0px';
        UIConvas.style.zIndex = '1';
        this.healthBars = {};
        // this.craeteObject();
        this.createPlayer1HealthBar();
        this.createPlayer2HealthBar();
        this.textureLoader = new THREE.TextureLoader();
    }
    resize(width, height) {
        this.aspect = width / height;
        this.renderer.setSize(width, height);
    }
    craeteObject() {
        const geometry = new THREE.BoxGeometry(1, 0, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(95 * this.aspect, 0, -90);
        this.addMesh(cube);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    addMesh(mesh) {
        this.scene.add(mesh);
    }
    removeMesh(mesh) {
        this.scene.remove(mesh);
    }
    loadPlayerImage(imagePath, position) {
        this.textureLoader.load(imagePath, (texture) => {
            console.log(texture);
            let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            // const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
            let geometry = new THREE.PlaneGeometry(10 * this.aspect, 10 * this.aspect);
            let plane = new THREE.Mesh(geometry, material);
            plane.rotateX(-Math.PI / 2);
            plane.position.copy(position);
            console.log(this);
            this.addMesh(plane);
            this.render();
        }, undefined, function (err) { console.error('An error happened.', err); });
    }
    loadText(position, origin, text) {
        let fontLoader = new FontLoader();
        fontLoader.load('assets/font.json', (font) => {
            let geometry = new TextGeometry(text, {
                font: font,
                size: 7,
                height: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 1,
                bevelSize: 0.1,
                bevelOffset: 0,
                bevelSegments: 5
            });
            let material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            let plane = new THREE.Mesh(geometry, material);
            plane.rotateX(-Math.PI / 2);
            plane.position.copy(position);
            if (origin == 1) {
                plane.position.x -= 4.5 * text.length;
            }
            this.addMesh(plane);
            this.render();
        });
    }
    loadPlayer1Text(text) {
        let position = new THREE.Vector3(-85 * this.aspect, 0, -72);
        this.loadText(position, -1, text);
    }
    loadPlayer2Text(text) {
        let position = new THREE.Vector3(85 * this.aspect, 0, -72);
        this.loadText(position, 1, text);
    }
    loadPlayer1Image(imagePath) {
        let position = new THREE.Vector3(-90 * this.aspect, 0, -80);
        this.loadPlayerImage(imagePath, position);
    }
    loadPlayer2Image(imagePath) {
        let position = new THREE.Vector3(90 * this.aspect, 0, -80);
        this.loadPlayerImage(imagePath, position);
    }
    createPlayer1HealthBar() {
        let position = new THREE.Vector3(-85 * this.aspect, 0, -85);
        let bar = new HealthBar(position, this.camera, this.scene, this.renderer, this.aspect);
        this.healthBars['player'] = bar;
    }
    updatePlayer1Health(HealthPercent) {
        this.healthBars['player'].update(HealthPercent);
    }
    createPlayer2HealthBar() {
        let position = new THREE.Vector3((85 - 45) * this.aspect, 0, -85);
        let bar = new HealthBar(position, this.camera, this.scene, this.renderer, this.aspect);
        bar.reverse();
        this.healthBars['player2'] = bar;
    }
    updatePlayer2Health(HealthPercent) {
        this.healthBars['player2'].update(HealthPercent);
    }
}
