import * as THREE from 'three';
class HealthBar {
    bar;
    size;
    scene;
    camera;
    renderer;
    constructor(position, camera, scene, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.bar = [];
        this.size = 10;
        this.createHealthBar(position);
    }
    createHealthBar(position) {
        let length = 3;
        let width = 3;
        const geometry = new THREE.BoxGeometry(length, 1, width);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const healthBar = new THREE.Mesh(geometry, material);
        healthBar.position.copy(position);
        healthBar.position.y = 0;
        healthBar.position.x += length / 2;
        healthBar.position.z += width / 2;
        this.bar.push(healthBar);
        for (let i = 1; i < 10; i++) {
            this.bar.push(healthBar.clone());
            this.bar[i].position.x += length * i;
            this.scene.add(this.bar[i]);
        }
        return this;
    }
    update(percentage) {
        let index = Math.floor(percentage * 10);
        for (let i = 0; i < index; i++) {
            this.bar[i].visible = true;
        }
        for (let i = index; i < 10; i++) {
            this.bar[i].visible = false;
        }
        this.renderer.render(this.scene, this.camera);
    }
}
export class UIRanderer {
    scene;
    camera;
    renderer;
    healthBars;
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1);
        this.renderer.setClearColor(0x000000, 0);
        let UIConvas = document.body.appendChild(this.renderer.domElement);
        UIConvas.style.position = 'absolute';
        UIConvas.style.top = '0px';
        UIConvas.style.left = '0px';
        this.healthBars = {};
        this.createPlayer1HealthBar();
        this.createPlayer2HealthBar();
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
    // createHealthBar(name: string, position: THREE.Vector3) {
    //     const ndcCoordinates = new THREE.Vector3( -2.427644815339166, -6.190291185572039, 0.995869729736663 );
    //     ndcCoordinates.unproject( this.camera );
    //     this.healthBars[name] = new HealthBar(ndcCoordinates);
    //     this.healthBars[name].bar.forEach((bar) => {
    //         console.log("##############", bar.position);
    //         this.addMesh(bar);
    //     });
    //     this.render();
    //     console.log("##############", this.healthBars);
    // }
    // updateHealthBar(name: string, percentage: number) {
    //     console.log("##############", name, percentage);
    //     if (!this.healthBars[name]) {
    //         return;
    //     }
    //     this.healthBars[name].update(percentage);
    //     this.render();
    // }
    createHealthBar(position) {
        // // let leftPoint = new THREE.Vector3();
        // // leftPoint.copy(healthBar.position);
        // // healthBar.updateWorldMatrix(true, false);
        // // const vector = new THREE.Vector3();
        // // vector.setFromMatrixPosition( healthBar.matrixWorld ); // Get world position
        // // vector.project( this.camera ); // Project to normalized screen coordinates
        const ndcCoordinates = new THREE.Vector3(-2.427644815339166, -6.190291185572039, 0.995869729736663);
        ndcCoordinates.unproject(this.camera);
        console.log("##############", ndcCoordinates);
        let bar = new HealthBar(ndcCoordinates, this.camera, this.scene, this.renderer);
        this.healthBars['player'] = bar;
    }
    createPlayer1HealthBar() {
        const ndcCoordinates = new THREE.Vector3(-2.427644815339166, -6.190291185572039, 0.995869729736663);
        ndcCoordinates.unproject(this.camera);
        console.log("##############", ndcCoordinates);
        let bar = new HealthBar(ndcCoordinates, this.camera, this.scene, this.renderer);
        this.healthBars['player'] = bar;
    }
    updatePlayer1Health(HealthPercent) {
        this.healthBars['player'].update(HealthPercent);
    }
    createPlayer2HealthBar() {
        const ndcCoordinates = new THREE.Vector3(-2.427644815339166, -6.190291185572039, 0.995869729736663);
        ndcCoordinates.unproject(this.camera);
        console.log("##############", ndcCoordinates);
        ndcCoordinates.x += 100;
        let bar = new HealthBar(ndcCoordinates, this.camera, this.scene, this.renderer);
        this.healthBars['player2'] = bar;
    }
    updatePlayer2Health(HealthPercent) {
        this.healthBars['player2'].update(HealthPercent);
    }
}
