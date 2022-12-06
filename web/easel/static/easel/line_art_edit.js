import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three_mesh_line';

// Get product data from dom
const product = JSON.parse(document.getElementById('product_data').textContent);
//console.log(product)
const product_url = JSON.parse(document.getElementById('product_url').textContent);
const line_art_url = JSON.parse(document.getElementById('line_art_url').textContent);
const d3 = document.getElementById("d3");

let height;
const renderer = new THREE.WebGLRenderer({antialias:true});

d3.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xFFFFFF );

const camera = new THREE.PerspectiveCamera( 75, d3.offsetWidth / height, 0.1, 1000 );
camera.position.z = 250;

const controls = new OrbitControls( camera, renderer.domElement );
controls.zoomSpeed = 2;
controls.enablePan = true;
controls.enableRotate = false;
controls.enableDamping = false;
//controls.target.set( 0, 0, 0 );

const light = new THREE.DirectionalLight( 0xFFFFFF, .7 ); 
scene.add(light);
const ambient_light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add(ambient_light);

const line_material = new MeshLineMaterial({
    resolution: new THREE.Vector2(d3.offsetWidth,d3.offsetHeight),
    color: new THREE.Color('hsl(0,0%,40%)'),
    sizeAttenuation: false,
});

// instantiate a loader
const svg_loader = new SVGLoader();
// load a SVG resource
svg_loader.load(line_art_url, function ( data ) {
        //const paths = data.paths;
        const group = new THREE.Group();
        for ( let i = 0; i < data.paths.length; i ++ ) {
            const path = data.paths[i];
            for ( let j = 0; j < path.subPaths.length; j ++ ) {
                const sub_path = path.subPaths[ j ];
                const geometry = new THREE.BufferGeometry().setFromPoints(sub_path.getPoints(50)); // 50 is line segments
                const line = new MeshLine();
                line.setGeometry(geometry, p=>3); //p=>3 is line width
                const mesh = new THREE.Mesh(line, line_material);
                mesh.scale.set(1, -1, -1);
                group.add(mesh);
            }
        }
        scene.add(group);
    },
    // called when loading is in progresses
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded (SVG)' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'SVG import error' );
        console.log(error);
    }
);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    renderer.render(scene, camera);
};
animate();

function update_viewport() {
    camera.aspect = d3.offsetWidth / d3.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( d3.offsetWidth, d3.offsetHeight );
    line_material.resolution = new THREE.Vector2(d3.offsetWidth,d3.offsetHeight);
};
window.onresize = function(){
    update_viewport();
};
update_viewport();