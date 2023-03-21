//import { ReactDOM } from 'react_dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



function Base(){
    const base = {
        csrftoken: document.querySelector('[name=csrfmiddlewaretoken]').value,
        viewport: document.getElementById('viewport_3d'),
        ui: ReactDOM.createRoot(document.getElementById('viewport_ui')),
        renderer: new THREE.WebGLRenderer({antialias:true}),
        scene: new THREE.Scene(),
        camera: new THREE.OrthographicCamera(-100, 100, 100, -100, 0.01, 10000 ),
        light: new THREE.DirectionalLight( 0xFFFFFF, .7 ),
    };
    //rending 3d
    base.renderer.setPixelRatio(window.devicePixelRatio); // helps to keep image crisp on some displays
    base.viewport.append(base.renderer.domElement);
    base.camera.position.z = 100; 
    //scene
    base.scene.background = new THREE.Color( 0xFFFFFF );
    base.scene.add(base.light);
    base.scene.add(new THREE.AmbientLight( 0x404040 ));
    //controls
    base.controls = new OrbitControls( base.camera, base.renderer.domElement );
    base.controls.zoomSpeed = 1;
    base.controls.enablePan = true;
    base.controls.enableRotate = false;
    base.controls.enableDamping = false;
    //plane
    const geometry = new THREE.PlaneGeometry( 10000, 10000 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    base.plane = new THREE.Mesh( geometry, material );
    base.scene.add( base.plane );

    base.update = function(){
        base.controls.update();
        base.light.position.set(base.camera.position.x, base.camera.position.y, base.camera.position.z);
        base.renderer.render(base.scene, base.camera);
    }

    base.fit = function(product){
        function fit_all(){
            base.camera.aspect = base.viewport.offsetWidth / base.viewport.offsetHeight;
            base.camera.left = -base.viewport.offsetWidth/2;
            base.camera.right = base.viewport.offsetWidth/2;
            base.camera.top = base.viewport.offsetHeight/2;
            base.camera.bottom = -base.viewport.offsetHeight/2;
            base.camera.updateProjectionMatrix();
            base.renderer.setSize( base.viewport.offsetWidth, base.viewport.offsetHeight );
            product.fit();
        }
        fit_all();
        window.addEventListener('resize', fit_all); 
        const camera_width  = base.camera.right*2;
        const camera_height = base.camera.top  *2;
        if(camera_width < camera_height){
            base.camera.zoom = camera_width  / (product.sketch.bounds.max.x - product.sketch.bounds.min.x)*.75;
        }else{
            base.camera.zoom = camera_height / (product.sketch.bounds.max.y - product.sketch.bounds.min.y)*.75;
        }
        base.camera.updateProjectionMatrix();
        
    }

    return base;
}export{Base}

const camera = new THREE.PerspectiveCamera( 75, viewport.outerWidth() / viewport.outerHeight(), 0.01, 10000 );
