import * as THREE from 'three';
class HealthBar {
    bar;
    size;
    scene;
    camera;
    renderer;
    reversed;
    constructor(position, camera, scene, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.bar = [];
        this.size = 10;
        this.reversed = false;
        this.createHealthBar(position);
    }
    createHealthBar(position) {
        let length = 10;
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
    hWidht;
    hHight;
    wUnit;
    hUnit;
    aspect;
    constructor(gameConvas) {
        this.scene = new THREE.Scene();
        // this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
        let height = gameConvas.getBoundingClientRect().height;
        let width = gameConvas.getBoundingClientRect().width;
        this.aspect = width / height;
        // this.camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 200 );
        this.camera = new THREE.OrthographicCamera(-100 * this.aspect, 100 * this.aspect, 100, -100, 0.1, 1000);
        this.camera.position.set(0, 100, 0);
        // PerspectiveCamera( 45, gameConvas.getBoundingClientRect().width / gameConvas.getBoundingClientRect().height, 0.1, 200 );
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1);
        this.renderer.setClearColor(0x000000, 0);
        let UIConvas = gameConvas.appendChild(this.renderer.domElement);
        UIConvas.style.position = 'absolute';
        UIConvas.style.top = '0px';
        UIConvas.style.left = '0px';
        UIConvas.style.zIndex = '1';
        this.healthBars = {};
        // this.calculatescreenPosition();
        // this.craeteObject();
        this.createPlayer1HealthBar();
        this.createPlayer2HealthBar();
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
    createPlayer1HealthBar() {
        let position = new THREE.Vector3(-95 * this.aspect, 0, -90);
        let bar = new HealthBar(position, this.camera, this.scene, this.renderer);
        this.healthBars['player'] = bar;
    }
    updatePlayer1Health(HealthPercent) {
        this.healthBars['player'].update(HealthPercent);
    }
    createPlayer2HealthBar() {
        let position = new THREE.Vector3((95 - 35) * this.aspect, 0, -90);
        let bar = new HealthBar(position, this.camera, this.scene, this.renderer);
        bar.reverse();
        this.healthBars['player2'] = bar;
    }
    updatePlayer2Health(HealthPercent) {
        this.healthBars['player2'].update(HealthPercent);
    }
}
