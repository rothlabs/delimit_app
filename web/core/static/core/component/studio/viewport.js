import {createElement as c, useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {CameraControls} from '@react-three/drei/CameraControls'; 
//import {Text} from '@react-three/drei/Text';
//import {Mover} from './mover.js';
//import {useS, ss, useSub, theme, gs, set_store} from '../../app.js';
//import {Pickbox} from './pickbox.js'; // selection box
//import {Vector3} from 'three';
import {
    set_store, use_store, get_store,
    Graph, Scene_Root,
    controls,
} from 'delimit';



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
            minDistance: 1000, 
            maxDistance: 1000, 
            draggingSmoothTime: 0.01,
            dollyToCursor: true,
            mouseButtons: {
                right:  studio_mode=='graph' ? 2 : 1, // 1=ROTATE
                middle: 2, // 2=TRUCK
                wheel:  16, // 16=ZOOM
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
        //if(!view) return;
        view.azimuth = controls.camera.azimuthAngle;
        view.polar = controls.camera.polarAngle;
        view.pos = controls.camera.getTarget();
        view.zoom = camera.zoom;
        //matrix: camera.matrix.clone();
        //dir: camera.getWorldDirection(v1).clone();
    });
}

export function Viewport(){ // for some reason this renders 5 times on load
    const scene = useRef();
    const light = useRef();
    const {camera} = useThree(); // raycaster 
    const studio_mode = use_store(d=> d.studio.mode);
    useEffect(()=>{
        if(!controls.camera) return;
        let view = controls.graph.view;
        if(studio_mode == 'scene') view = controls.scene.view
        set_camera_from_view(view);
    },[studio_mode]);
    useEffect(()=>{
        camera.add(light.current);
    },[]);
    return c('group', {
        ref: scene,
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
        c('directionalLight', { 
            ref:light,
            color: 'white',
            intensity: 1,
            position: [0,0,1000],
        }),
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
    controls.camera.dollyTo(1000);
}






        // // pick_box && c(Pickbox, { // studio mode causes this to render and removes selection!!!!!!!
        // //     style:{
        // //         border: "1px dashed #d6006a", // backgroundColor: "rgba(75, 160, 255, 0.3)",
        // //         position: "fixed",
        // //     },
        // //     onSelectionChanged:objs=>set_store(d=>{ // key pressing making this fire ?!?!?!?! wtf
        // //         if(!d.pick.multi) d.pick.none(d);
        // //         const nodes = [];
        // //         objs.forEach(obj=>{
        // //             const pickable = obj.parent?.__r3f?.memoizedProps.pickable;
        // //             if(pickable) nodes.push(pickable);
        // //         });
        // //         d.pick.set(d, nodes, true);
        // //     }),
        // // }),


        // c(Text, {
        //     text: 'delimit',
        //     //characters: 'abcdefghijklmnopqrstuvwxyz0123456789!',
        //     font, 
        //     position: [1000, 1000, 1000],
        // }),


        //d.camera = camera;
        // d.camera_controls.addEventListener('controlend', e=>set_store(d=>{
        //     if(d.cam_info.dir.dot(camera.getWorldDirection(v1)) < 1){
        //         d.cam_info = {matrix: camera.matrix, dir:camera.getWorldDirection(v1).clone()};
        //     }
        // }));




// export function Board(){
//     const obj = useRef();
//     const {camera} = useThree(); 
//     useEffect(()=>{
//         camera.add(obj.current);
//     },[]);
//     //console.log('board render');
//     return (
//         c('mesh', { 
//             ref: obj,
//             name: 'board',
//             position:[0,0,-2000],
//             onClick(e){
//                 e.stopPropagation();
//                 ss(d=>{
//                     if(!d.studio.gizmo_active && e.delta < d.max_click_delta){
//                         d.pick.none(d);
//                     }
//                     d.studio.gizmo_active = false;
//                 });
                
//             },
//         },   
//             c('planeGeometry', {args:[20000, 20000],}),
//             c('meshBasicMaterial', {color:theme.bg_body, toneMapped:false}), // theme.bg_body
//         )
//     )
// }


