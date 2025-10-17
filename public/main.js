import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';

//Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//const renderer = new THREE.WebGLRenderer();
const renderer = new SVGRenderer();
//renderer.overdraw = 1;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Geometry

//const colors = [ 0x00ff00, 0xff0000 ];
const colors = [ 0x00ff00 ];
const cubes = [];
const lines = [];

colors.forEach((color) => {
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( {
    color,
    side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: 1, 
      polygonOffsetUnits: 1
  } );
  const cube = new THREE.Mesh( geometry, material );


  // Use the official EdgesGeometry to derive the outline segments
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000,
      linewidth: 10,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -1, 
      polygonOffsetUnits: 1
  });

  // const loop = new convertEdgesToLinePath(edgeGeometry);
  // const line = new THREE.LineLoop(loop, edgeMaterial);

  const line = new THREE.LineSegments(edgeGeometry, edgeMaterial);

  // ⭐ Apply the fixes for SVGRenderer overlap and order
  //line.renderOrder = 1;         // Ensures lines draw *after* the cube
  line.scale.setScalar(1.5);  // Minimal offset to prevent Z-fighting

  // Group the line with the cube
  //cube.add( line );
  scene.add(line);
  scene.add( cube );

});

//controls?
const controls = new OrbitControls(camera, renderer.domElement);

controls.autoRotate = false;
controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
}
camera.position.z = 5;
controls.update();

//Renderer
function animate() {
  requestAnimationFrame( animate );

  renderer.render( scene, camera );
  //Animation
  //cubes[1].rotation.x -= 0.01;
  //cubes[1].rotation.y -= 0.01;

  controls.update(); // Update the camera controls
  	camera.updateProjectionMatrix();
}
//requestAnimationFrame( animate );
animate();
//this one doesn't work with SVG
//renderer.setAnimationLoop( animate );



function convertEdgesToLinePath(edgeGeometry) {
    const positionAttribute = edgeGeometry.getAttribute('position');
    const vertices = [];
    const edgeList = []; // Array of pairs (start, end)
    
    // 1. Convert BufferGeometry position data into an array of Line objects
    for (let i = 0; i < positionAttribute.count; i += 2) {
        const start = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
        const end = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1);
        edgeList.push({ start, end, used: false });
    }

    if (edgeList.length === 0) return new THREE.BufferGeometry();

    // 2. Start the continuous path from the first edge
    let currentEdge = edgeList[0];
    currentEdge.used = true;
    vertices.push(currentEdge.start, currentEdge.end);
    let currentPoint = currentEdge.end;
    let edgesRemaining = edgeList.length - 1;

    // 3. Loop until all edges are connected
    while (edgesRemaining > 0) {
        let foundNext = false;
        
        // Find the closest unused edge segment
        let bestMatch = null;
        let minDistance = Infinity;
        let matchType = ''; // 'start' or 'end'

        for (let i = 0; i < edgeList.length; i++) {
            const edge = edgeList[i];
            if (edge.used) continue;

            // Check distance to start point of the next edge
            const distToStart = currentPoint.distanceTo(edge.start);
            if (distToStart < minDistance) {
                minDistance = distToStart;
                bestMatch = edge;
                matchType = 'start';
                foundNext = true;
            }

            // Check distance to end point of the next edge
            const distToEnd = currentPoint.distanceTo(edge.end);
            if (distToEnd < minDistance) {
                minDistance = distToEnd;
                bestMatch = edge;
                matchType = 'end';
                foundNext = true;
            }
        }

        // If a connection is found (distance should be close to zero)
        if (foundNext && minDistance < 0.001) { // Use a small tolerance for floating point errors
            bestMatch.used = true;
            edgesRemaining--;

            if (matchType === 'start') {
                // The next segment starts where the current one ends (A->B, B->C)
                vertices.push(bestMatch.end);
                currentPoint = bestMatch.end;
            } else if (matchType === 'end') {
                // The next segment needs to be reversed (A->B, D->B needs to become B->D)
                vertices.push(bestMatch.start);
                currentPoint = bestMatch.start;
            }
        } else {
            // Cannot find a connection: start a new path segment.
            // This happens because a cube's edges don't form a single continuous line.
            console.warn(`Path interrupted! Starting a new segment.`);
            
            // Find the next unused edge to restart the path
            const nextStartEdge = edgeList.find(e => !e.used);
            if (nextStartEdge) {
                nextStartEdge.used = true;
                edgesRemaining--;
                // Add the new start point, but first, the previous point must be pushed 
                // so the path segments are defined by point pairs (currentPoint, nextStartPoint)
                // For a clean break, we just add the next start point.
                vertices.push(nextStartEdge.start, nextStartEdge.end);
                currentPoint = nextStartEdge.end;
            } else {
                break; // Should not happen if edgesRemaining > 0
            }
        }
    }

    // 4. Create new BufferGeometry from the ordered vertices
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    return geometry;
}
