import {createElement as c, useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {CameraControls} from '@react-three/drei/CameraControls'; 
import {
    set_store, use_store, get_store,
    Graph, Scene_Root,
    controls,
} from 'delimit';
import {AmbientLight, DirectionalLight, Vector3} from 'three';

const pivot_to_camera_distance = 5000;

function Viewport_Control(){
    const camera_controls = useRef();
    const studio_mode = use_store(d=> d.studio.mode);
    const {camera} = useThree(); 
    useEffect(() => { 
        if(!camera_controls.current) return;
        controls.camera = camera_controls.current;
        set_view_from_camera(camera);
    },[camera_controls]);

    return c('group', {name:'viewport_parts'}, 
        c(CameraControls, {
            ref: camera_controls,
            makeDefault: true,
            minDistance: pivot_to_camera_distance, 
            maxDistance: pivot_to_camera_distance, 
            draggingSmoothTime: 0.01,
            dollyToCursor: true,
            mouseButtons: {
                right:  studio_mode=='graph' ? 2 : 1, // 1=ROTATE
                middle: 2, // 2=TRUCK
                wheel:  16, // 16=ZOOM
            },
            touches: {
                one: studio_mode=='graph' ? null : 1,
                two: 8192, // TOUCH_ZOOM_TRUCK
                three: 8192, // TOUCH_ZOOM_TRUCK
            },
            //polarRotateSpeed: (acting || pick_box || studio_mode=='graph' ? 0 : 1), 
            //azimuthRotateSpeed: (acting || pick_box || studio_mode=='graph' ? 0 : 1), 
        }), 
    )
}

function set_view_from_camera(camera){
    controls.camera.addEventListener('control', () => {// need to remove listener ?!?!?!?!
        const d = get_store();
        let view = controls.graph.view;
        if(d.studio.mode == 'scene') view = controls.scene.view
        view.azimuth = controls.camera.azimuthAngle;
        view.polar = controls.camera.polarAngle;
        view.pos = controls.camera.getTarget();
        view.zoom = camera.zoom;
        //matrix: camera.matrix.clone();
        //dir: camera.getWorldDirection(v1).clone();
    });
}

export function Viewport(){ // for some reason this renders 5 times on load
    //const scene = useRef();
    //const dir_light = useRef();
    const {camera, scene} = useThree(); // raycaster 
    const studio_mode = use_store(d=> d.studio.mode);
    useEffect(()=>{
        if(!controls.camera) return;
        let view = controls.graph.view;
        if(studio_mode == 'scene') view = controls.scene.view
        set_camera_from_view(view);
    },[studio_mode]);
    useEffect(()=>{
        set_store(d=> d.camera = camera);
        const light = new DirectionalLight('white', 1);
        camera.add(light);
        scene.add(camera);
    },[]);
    return c('group', {
        //ref: scene,
        name:'viewport',
        onPointerMissed(e){
            //console.log(e.which);
            //e.stopPropagation();
            if(e.which == 1) set_store(d=> d.unpick(d, {})); //mode:'primary'
            //if(e.which == 3) set_store(d=> d.unpick(d, {mode:'secondary'})); 
            //set_store(d=> d.unpick(d, {mode:'primary'}));
        },
    }, 
        c(Viewport_Control),
        studio_mode=='graph'  && c(Graph),
        studio_mode=='scene' && c(Scene_Root),
        c('ambientLight', {
            color: 'white',
            intensity: 0.25,
        }),
    )
}


function set_camera_from_view(view){
    if(view.pos){
        controls.camera.rotateTo(view.azimuth, view.polar);
        controls.camera.moveTo(view.pos.x, view.pos.y, view.pos.z);
        controls.camera.zoomTo(view.zoom); // d.cam_info = {matrix:view.matrix, dir:view.dir};
    }else{
        // maybe fit to view here #1
        controls.camera.rotateTo(0, Math.PI/2);
        controls.camera.moveTo(0, 0, 0);
        controls.camera.zoomTo(1);
    }
    controls.camera.dollyTo(pivot_to_camera_distance);
}