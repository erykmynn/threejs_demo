import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Geometry

const colors = [ 0x00ff00, 0xff0000 ];
const cubes = [];

colors.forEach((color) => {
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color } );
  const cube = new THREE.Mesh( geometry, material );
  cubes.push( cube );
  scene.add( cube );
});

//controls?
const controls = new OrbitControls(camera, renderer.domElement);

controls.autoRotate = true;
controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
}
camera.position.z = 5;
controls.update();

//Renderer
function animate() {
  //requestAnimationFrame( animate );

  renderer.render( scene, camera );
  //Animation
  cubes[1].rotation.x -= 0.01;
  cubes[1].rotation.y -= 0.01;

  controls.update(); // Update the camera controls

}
renderer.setAnimationLoop( animate );