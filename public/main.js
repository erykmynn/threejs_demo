import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';

let camera, scene, renderer, controls, cubes;

init();
animate();



function init() {
  //Scene
  scene = new THREE.Scene();

  //Renderer A
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });;
  renderer.setClearColor(0x000000, 0); 
  //Renderer B
  // renderer = new SVGRenderer();

  //renderer settings
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //Camera
  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  //controls?
  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = false;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  }
  // camera.position.z = 5;
  //dunno if this neeeds to be here
  controls.update();


  //Geometries

  //THE PLANE
  const planeSize = 40;
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);

//THE SPHERE

  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(-sphereRadius -1, sphereRadius + 0, 0);
  scene.add(sphere);

//the CONE
  const coneRadius = 2; 
  const coneHeight = 4;
  const coneSegments = 32;
  const coneGeo = new THREE.ConeGeometry( coneRadius, coneHeight, coneSegments );
  const coneMat = new THREE.MeshPhongMaterial({color: 'rgba(153, 29, 191, 1)'});
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(coneRadius +1, coneHeight/2, 0);
  scene.add(cone);

  //const colors = [ 0x00ff00, 0xff0000 ];
  const colors = [ 0x00ff00 ];
  cubes = [];
  const cubeSize = 2;

  colors.forEach((color) => {
    const geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
    const material = new THREE.MeshPhongMaterial( {
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
    //line.scale.setScalar(2);  // Minimal offset to prevent Z-fighting

    // Group the line with the cube
    //cube.add( line );
    //cube.add(line);
    cube.position.set(0,1,0);

    scene.add( cube );
    cubes.push( cube );
    console.log(cubes[0].children[0]);

    const ambientColor = 0xFFFFFF;
    const intensity = .1;
    const ambientLight = new THREE.AmbientLight(ambientColor, intensity);
    scene.add(ambientLight);


    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

    directionalLight.target = cubes[0];
    directionalLight.position.set(5,10,7.5);
    // directionalLight.target = sphere;
    scene.add( directionalLight );


  });



}


var scaleDirection;
//Renderer
function animate() {
  requestAnimationFrame( animate );

  renderer.render( scene, camera );
  //Animation
  //cubes[0].rotation.x -= 0.005;
  //cubes[0].rotation.y -= 0.007;


//const cubeToAnimate = cubes[0].children[0];
const cubeToAnimate = false;
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