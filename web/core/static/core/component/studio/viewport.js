import {createElement as c, useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {CameraControls} from '@react-three/drei/CameraControls'; 
//import {Text} from '@react-three/drei/Text';
//import {Mover} from './mover.js';
//import {useS, ss, useSub, theme, gs, set_store} from '../../app.js';
//import {Pickbox} from './pickbox.js'; // selection box
//import {Vector3} from 'three';
import {
    set_store, use_store, 
    Graph, Scene,
} from 'delimit';

//const v1 = new Vector3();

function Viewport_Control(){
    const camera_controls = useRef();
    const pick_box = use_store(d=> d.pick.box);
    const acting = false;//use_store(d=> d.design.act);
    const studio_mode = use_store(d=> d.studio.mode);
    const {camera} = useThree(); 
    useEffect(()=>{ set_store(d=>{
        d.camera_controls = camera_controls.current;
        //d.camera = camera;
        // d.camera_controls.addEventListener('controlend', e=>set_store(d=>{
        //     if(d.cam_info.dir.dot(camera.getWorldDirection(v1)) < 1){
        //         d.cam_info = {matrix: camera.matrix, dir:camera.getWorldDirection(v1).clone()};
        //     }
        // }));
        d.camera_controls.addEventListener('control', ()=>set_store(d=>{ // need to remove listener ?!?!?!?!
            if(d.studio.mode == 'graph'){
                d.graph.view = {
                    azimuth: d.camera_controls.azimuthAngle,
                    polar: d.camera_controls.polarAngle,
                    pos: d.camera_controls.getTarget(),
                    zoom: camera.zoom,
                    //matrix: camera.matrix.clone(),
                    //dir: camera.getWorldDirection(v1).clone(),
                };
            }else if(d.studio.mode=='design'){ //  && d.design.part
                // d.n[d.design.part].c_c = {
                //     azimuth: d.camera_controls.azimuthAngle,
                //     polar: d.camera_controls.polarAngle,
                //     pos: d.camera_controls.getTarget(),
                //     zoom: camera.zoom,
                //     matrix: camera.matrix.clone(),
                //     dir: camera.getWorldDirection(v1).clone(),
                // };
            }
        }));
    })},[camera_controls]);
    return c('group', {name:'viewport_parts'}, 
        c(CameraControls, {
            ref: camera_controls,
            makeDefault: true,
            minDistance: 1000, 
            maxDistance: 1000, 
            polarRotateSpeed: (acting || pick_box || studio_mode=='graph' ? 0 : 1), 
            azimuthRotateSpeed: (acting || pick_box || studio_mode=='graph' ? 0 : 1), 
            draggingSmoothTime: 0.01,
            dollyToCursor: true,
        }), 
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
    )
}

export function Viewport(){ // for some reason this renders 5 times on load
    const scene = useRef();
    const light = useRef();
    const {camera} = useThree(); // raycaster 
    const studio_mode = use_store(d=> d.studio.mode);
    //const font = use_store(d=> d.font.body);
    useEffect(()=>{
        set_store(d=>{
            if(d.camera_controls){
                //console.log('Viewport use effect');
                let view = null;
                if(studio_mode=='graph'){ view = d.graph.view }
                //else if(studio_mode=='design'){ view = d.n[d.design.part].c_c }
                if(view){
                    d.camera_controls.rotateTo(view.azimuth, view.polar);
                    d.camera_controls.moveTo(view.pos.x, view.pos.y, view.pos.z);
                    d.camera_controls.zoomTo(view.zoom);
                    //d.cam_info = {matrix:view.matrix, dir:view.dir};
                }else{
                    // maybe fit to view here #1
                    d.camera_controls.rotateTo(0,Math.PI/2);
                    d.camera_controls.moveTo(0,0,0);
                    d.camera_controls.zoomTo(1);
                }
                d.camera_controls.dollyTo(1000);
            }
        });
    },[studio_mode]);
    useEffect(()=>{
        // set_store(d=>{
        //     d.scene = scene.current;
        //     //d.invalidate = invalidate;
        // });
        //scene.add(camera);
        camera.add(light.current);
    },[]);
    //const d = gs();
    //console.log('render viewport');
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
        studio_mode=='scene' && c(Scene),
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
        // c(Text, {
        //     text: 'delimit',
        //     //characters: 'abcdefghijklmnopqrstuvwxyz0123456789!',
        //     font, 
        //     position: [1000, 1000, 1000],
        // }),
    )
}

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


