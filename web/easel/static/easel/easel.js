import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three_mesh_line';

//dom
const viewport = $('#viewport');
const product_data = JSON.parse($('#product_data').text());
const product_file = JSON.parse($('#product_file').text());

//enviroment 
const renderer = new THREE.WebGLRenderer({antialias:true});
viewport.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xFFFFFF );
//const camera = new THREE.PerspectiveCamera( 75, viewport.outerWidth() / viewport.outerHeight(), 0.01, 10000 );
const camera = new THREE.OrthographicCamera(-100,100,100,-100, 0.01, 10000 );
camera.position.z = 100;

//lighting
const light = new THREE.DirectionalLight( 0xFFFFFF, .7 ); 
scene.add(light);
const ambient_light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add(ambient_light);

//camera controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.zoomSpeed = 2;
controls.enablePan = true;
controls.enableRotate = false;
controls.enableDamping = false;

//line material
let line_materials = [];

//pointer
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function set_pointer(event) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //console.log(pointer);
}
window.addEventListener('pointermove', set_pointer);

//plane
const geometry = new THREE.PlaneGeometry( 10000, 10000 );
const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
scene.add( plane );

//import shoe
const loader = new GLTFLoader();
loader.load(product_file, function ( data ) {
    for ( let i = 0; i < data.scene.children.length; i ++ ) {
        //if(data.scene.children[i].name == 'tv0'){
        //    console.log('tv0');
        const geometry = new THREE.BufferGeometry();
        const verts = new Array();
        let pos = data.scene.children[i].geometry.attributes.position.array;
        for ( let k = 0; k < pos.length; k += 3 ) {
            if(pos[k+2] < 1){
                verts.push(pos[k]);
                verts.push(pos[k+1]);
                verts.push(pos[k+2]);
            }
        }
        const line = new MeshLine();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(verts), 3 ) );
        line.setGeometry(geometry, p=>6); //p=>6 is line width    data.scene.children[i].geometry
        const line_material = new MeshLineMaterial({
            resolution: new THREE.Vector2(viewport.outerWidth(),viewport.outerHeight()),
            color: new THREE.Color('hsl(0,0%,40%)'),
            sizeAttenuation: false,
        });
        line_materials.push(line_material);
        const mesh = new THREE.Mesh(line, line_material);
        mesh.raycast = MeshLineRaycast;
        scene.add(mesh);
            //console.log('meshed');
        //}
    }
    //scene.add( data.scene );
}, undefined, function ( error ) {
    console.error( error );
} );

//const drawing = new THREE.Group();
//const svg_loader = new SVGLoader();
// svg_loader.load(line_art_url, function ( data ) {
//         const child_nodes = data.xml.childNodes;
//         for ( let i = 0; i < data.paths.length; i ++ ) {
//             const path = data.paths[i].subPaths[0];
//                 path.name = child_nodes[i+2].id;
//                 console.log(path.name);
//                 const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints(50)); // 50 is line segments
//                 const line = new MeshLine();
//                 line.setGeometry(geometry, p=>6); //p=>6 is line width
//                 const line_material = new MeshLineMaterial({
//                     resolution: new THREE.Vector2(viewport.outerWidth(),viewport.outerHeight()),
//                     color: new THREE.Color('hsl(0,0%,40%)'),
//                     sizeAttenuation: false,
//                 });
//                 line_materials.push(line_material);
//                 const mesh = new THREE.Mesh(line, line_material);
//                 mesh.raycast = MeshLineRaycast;
//                 drawing.add(mesh);
//         }
//         scene.add(drawing);

//update loop
function update() {

    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );
	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
	for ( let i = 0; i < intersects.length; i ++ ) {
		//intersects[ i ].object.material.color.set( 0xff0000 );
        if(intersects[ i ].object == plane){
            //console.log('hit!');
        }
	}

    controls.update();
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    renderer.render(scene, camera);
    requestAnimationFrame(update);
};
update();

//resizing viewport
function resize_viewport(){
    //camera.aspect = viewport.outerWidth() / viewport.outerHeight();
    camera.left = -viewport.outerWidth()/4;
    camera.right = viewport.outerWidth()/4;
    camera.top = viewport.outerHeight()/4;
    camera.bottom = -viewport.outerHeight()/4;
    camera.updateProjectionMatrix();
    renderer.setSize( viewport.outerWidth(), viewport.outerHeight() );
    for(let i=0; i<line_materials.length; i++){
        line_materials[i].resolution = new THREE.Vector2(viewport.outerWidth(),viewport.outerHeight());
    }
}
resize_viewport();
window.addEventListener('resize', resize_viewport );
//window.onresize = resize_viewport;
