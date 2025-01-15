import * as THREE from 'three';

export class UIRanderer {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;

    constructor() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(0,0,0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio * 1);
        this.renderer.setClearColor(0x000000, 0);

        let UIConvas =  document.body.appendChild( this.renderer.domElement );
        UIConvas.style.position = 'absolute';
        UIConvas.style.top = '0px';
        UIConvas.style.left = '0px';
    }

    render() {
        this.renderer.render( this.scene, this.camera );
    }

    addMesh(mesh: THREE.Mesh) {
        this.scene.add(mesh);
    }

    removeMesh(mesh: THREE.Mesh) {
        this.scene.remove(mesh);
    }

    createHealthBar() {
        let length = 30;
        let width = 3;
        const geometry = new THREE.BoxGeometry( length, 1, width );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const healthBar = new THREE.Mesh( geometry, material );
        // healthBar.position.set(-55, 0, -39);

        // let leftPoint = new THREE.Vector3();
        // leftPoint.copy(healthBar.position);
        // healthBar.updateWorldMatrix(true, false);
        // const vector = new THREE.Vector3();
        // vector.setFromMatrixPosition( healthBar.matrixWorld ); // Get world position
        // vector.project( this.camera ); // Project to normalized screen coordinates

        // console.log("##############", vector);

        // const ndcCoordinates = new THREE.Vector3( -2.4, -6.1, 0.8 );
        const ndcCoordinates = new THREE.Vector3( -2.427644815339166, -6.190291185572039, 0.995869729736663 );
        // ndcCoordinates.normalize();
        ndcCoordinates.unproject( this.camera );
        console.log("##############", ndcCoordinates);
        healthBar.position.copy(ndcCoordinates);
        healthBar.position.y = 0;
        healthBar.position.x += length / 2;
        healthBar.position.z += width / 2;
        // healthBar.add(this.camera);

        // this.camera.updateMatrixWorld();
        // this.camera.updateProjectionMatrix();
        // this.camera.updateWorldMatrix();
        // this.camera.updateMatrix();
        // healthBar.updateMatrixWorld();

        // const width2 = window.innerWidth;
        // const height = window.innerHeight;

        // let pos = new THREE.Vector3();
        // pos = pos.setFromMatrixPosition(healthBar.matrixWorld);
        // pos.project(this.camera);
        // pos.x = (pos.x + 1) * width2 / 2;
        // pos.y = -(pos.y - 1) * height / 2;
        
        this.addMesh(healthBar);
    }
}