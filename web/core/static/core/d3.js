import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';



function easel(d3_url, x,y,z, sketch_yz){

    console.log(sketch_yz)

    let d3 = document.getElementById("d3");
    let view_x = document.getElementById("id_view_x");
    let view_y = document.getElementById("id_view_y");
    let view_z = document.getElementById("id_view_z");
    let height;// = 500;


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
    camera.position.set(x,y,z);

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

    //function load_model(model_url){
        loader.load( d3_url, function ( gltf ) {
            scene.add( gltf.scene );
            //model = gltf
            animate();
        }, undefined, function ( error ) {
            console.error( error );
        } );
    //}



    function animate() {
        requestAnimationFrame( animate );

        //model.rotation.x += 0.01;
        //model.rotation.y += 0.01;

        controls.update();

        light.position.set( camera.position.x,camera.position.y,camera.position.z );
        view_x.value = camera.position.x;
        view_y.value = camera.position.y;
        view_z.value = camera.position.z;
        //console.log(light.position);
        renderer.render( scene, camera );
    };

    update_viewport();

}

export {easel}