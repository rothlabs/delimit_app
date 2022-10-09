//This module is a disorganized playground to learn three.js and svg.js
//It needs reworked, it's a complete mess



import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVG } from 'svg'; // "https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.min.js"



// Get product data from dom
const product = JSON.parse(document.getElementById('product_data').textContent);
const product_url = JSON.parse(document.getElementById('product_url').textContent);
const sketch_xy_url = JSON.parse(document.getElementById('sketch_xy_url').textContent);
const sketch_yz_url = JSON.parse(document.getElementById('sketch_yz_url').textContent);


console.log(product)

//function run(d3_url, x,y,z, sketch_yz_url){


    const d3 = document.getElementById("d3");
    const view_x = document.getElementById("id_view_x");
    const view_y = document.getElementById("id_view_y");
    const view_z = document.getElementById("id_view_z");
    let height;


    // draw a rect appended to body with svg.js
    let draw = SVG().addTo('body').size(300, 300);
    let rect = draw.rect(100, 100).attr({ fill: '#f06' });


    const renderer = new THREE.WebGLRenderer();
    //renderer.toneMappingExposure = 0.8;
    //renderer.setSize( d3.offsetWidth*1.5, d3.offsetHeight*1.5 );
    d3.appendChild( renderer.domElement );

    function update_viewport() {
        height = d3.offsetWidth * 0.8;
        camera.aspect = d3.offsetWidth / height;
        camera.updateProjectionMatrix();
        renderer.setSize( d3.offsetWidth, height );
    };

    window.onresize = function(){
        update_viewport();
    };


    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFFFFFF );

    //const pmremGenerator = new THREE.PMREMGenerator( renderer );
    //scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

    const camera = new THREE.PerspectiveCamera( 75, d3.offsetWidth / height, 0.1, 1000 );
    //camera.position.z = 250;
    camera.position.set(product['view_x'],product['view_y'],product['view_z']);

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight( 0xFFFFFF, .7 ); 
    scene.add( light );
    const ambient_light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambient_light );


    //let model;

    //const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    //const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    //const cube = new THREE.Mesh( geometry, material );
    //scene.add( cube );
    const loader = new GLTFLoader();
    loader.load(product_url, function ( gltf ) {
        scene.add( gltf.scene );
        //model = gltf
        animate();
    }, undefined, function ( error ) {
        console.error( error );
    } );

    // instantiate a loader
    const svg_loader = new SVGLoader();
    // load a SVG resource
    svg_loader.load(sketch_yz_url, function ( data ) {
            const paths = data.paths;
            const group = new THREE.Group();
            for ( let i = 0; i < paths.length; i ++ ) {
                const path = paths[ i ];
                const material = new THREE.MeshBasicMaterial( {
                    color: path.color,
                    side: THREE.DoubleSide,
                    depthWrite: false
                } );
                const shapes = SVGLoader.createShapes( path );
                for ( let j = 0; j < shapes.length; j ++ ) {
                    const shape = shapes[ j ];
                    const geometry = new THREE.ShapeGeometry( shape );
                    const mesh = new THREE.Mesh( geometry, material );
                    group.add( mesh );
                }
            }
            scene.add( group );
            group.position.set(100,0,0)
            group.rotation.set(0,-1.5708,3.14159)
        },
        // called when loading is in progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded (SVG)' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened (SVG)' );
        }
    );

    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        light.position.set( camera.position.x,camera.position.y,camera.position.z );
        view_x.value = camera.position.x;
        view_y.value = camera.position.y;
        view_z.value = camera.position.z;
        renderer.render( scene, camera );
    };

    update_viewport();
//}

//export {run}



