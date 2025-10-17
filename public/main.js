import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';

let camera, scene, renderer, controls, cubes;

init();
animate();



function init() {
    //Scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  // renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });;
  // renderer.setClearColor(0x000000, 0); 

  renderer = new SVGRenderer();


  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //Geometry

  //const colors = [ 0x00ff00, 0xff0000 ];
  const colors = [ 0x00ff00 ];
  cubes = [];

  colors.forEach((color) => {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {
      color,
        // polygonOffset: true,
        // polygonOffsetFactor: 1, 
        // polygonOffsetUnits: 1
    } );
    const cube = new THREE.Mesh( geometry, material );


    // Use the official EdgesGeometry to derive the outline segments
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x0000ff,
        linewidth: 5,
        // polygonOffset: true,
        // polygonOffsetFactor: -1, 
        // polygonOffsetUnits: 1
    });

    // const loop = new convertEdgesToLinePath(edgeGeometry);
    // const line = new THREE.LineLoop(loop, edgeMaterial);

    const line = new THREE.LineSegments(edgeGeometry, edgeMaterial);

    // ⭐ Apply the fixes for SVGRenderer overlap and order
    //line.renderOrder = 1;         // Ensures lines draw *after* the cube
    line.scale.setScalar(2);  // Minimal offset to prevent Z-fighting

    // Group the line with the cube
    //cube.add( line );
    cube.add(line);
    scene.add( cube );
    cubes.push( cube );
    console.log(cubes[0].children[0]);
  });


  //controls?
  controls = new OrbitControls(camera, renderer.domElement);

  controls.autoRotate = false;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  }
  camera.position.z = 5;
  controls.update();

}


var scaleDirection;
//Renderer
function animate() {
  requestAnimationFrame( animate );

  renderer.render( scene, camera );
  //Animation
  cubes[0].rotation.x -= 0.005;
  cubes[0].rotation.y -= 0.007;


const cubeToAnimate = cubes[0].children[0];
const maxScale = 1.8;
const minScale = 1;
const scaleSpeed = .01;

    // *** 2. Linear Scale Animation Code with IF/ELSE ***
    if (cubeToAnimate) {
        
        let currentScale = cubeToAnimate.scale.x;

        // Check the boundaries and flip the direction
        if (currentScale >= maxScale) {
            scaleDirection = -1; // Switch to shrinking
        } else if (currentScale <= minScale) {
          scaleDirection = 1;
        } 
        console.log(scaleDirection);
        // Calculate the new scale
        const newScale = currentScale + scaleDirection * scaleSpeed;
        
        // Apply the new scale
        cubeToAnimate.scale.set(newScale, newScale, newScale);

    }



  controls.update(); // Update the camera controls
  camera.updateProjectionMatrix();
}