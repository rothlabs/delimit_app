import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {useThree} from '@react-three/fiber';
import {CameraControls} from '@react-three/drei/CameraControls'; 
//import {OrbitControls} from '@react-three/drei/OrbitControls';

import {Design} from '../design/design.js';
import {Graph} from '../graph/graph.js';
//import {Mover} from './mover.js';
import {useS, ss, useSub, theme, gs, rs} from '../../app.js';
import {Pickbox} from './pickbox.js'; // selection box
import {Vector3} from 'three';

const v1 = new Vector3();

function Viewport_Control(){
    const camera_controls = useRef();
    const pick_box = useS(d=> d.pick.box);
    const acting = useS(d=> d.design.act);
    const studio_mode = useS(d=> d.studio.mode);
    const {camera} = useThree(); 
    useEffect(()=>rs(d=>{
        d.camera_controls = camera_controls.current;
        d.camera = camera;
        d.camera_controls.addEventListener('controlend', (e)=>rs(d=>{
            if(d.cam_info.dir.dot(camera.getWorldDirection(v1)) < 1){
                d.cam_info = {matrix: camera.matrix, dir:camera.getWorldDirection(v1).clone()};
            }
        }));
        d.camera_controls.addEventListener('control', ()=>rs(d=>{ // need to remove listener ?!?!?!?!
            if(d.studio.mode=='graph' && d.design.part){
                d.graph.c_c = {
                    azimuth: d.camera_controls.azimuthAngle,
                    polar: d.camera_controls.polarAngle,
                    pos: d.camera_controls.getTarget(),
                    zoom: camera.zoom,
                    matrix: camera.matrix.clone(),
                    dir: camera.getWorldDirection(v1).clone(),
                };
            }else if(d.studio.mode=='design'){
                d.n[d.design.part].c_c = {
                    azimuth: d.camera_controls.azimuthAngle,
                    polar: d.camera_controls.polarAngle,
                    pos: d.camera_controls.getTarget(),
                    zoom: camera.zoom,
                    matrix: camera.matrix.clone(),
                    dir: camera.getWorldDirection(v1).clone(),
                };
            }
        }));
    }),[camera_controls]);
    return(c('group', {name:'viewport_parts'}, 
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
        pick_box && c(Pickbox, { // studio mode causes this to render and removes selection!!!!!!!
            style:{
                border: "1px dashed #d6006a", // backgroundColor: "rgba(75, 160, 255, 0.3)",
                position: "fixed",
            },
            onSelectionChanged:objs=>ss(d=>{ // key pressing making this fire ?!?!?!?! wtf
                if(!d.pick.multi) d.pick.none(d);
                const nodes = [];
                objs.forEach(obj=>{
                    const pickable = obj.parent?.__r3f?.memoizedProps.pickable;
                    if(pickable) nodes.push(pickable);
                });
                d.pick.set(d, nodes, true);
            }),
        }),
    ))
}

export function Viewport(){ // for some reason this renders 5 times on load
    const light = useRef();
    const {scene, camera} = useThree(); // raycaster 
    const studio_mode = useS(d=> d.studio.mode);
    useEffect(()=>{
        rs(d=>{
            if(d.camera_controls){
                var cc = null;
                if(studio_mode=='graph'){ cc = d.graph.c_c }
                else if(studio_mode=='design'){ cc = d.n[d.design.part].c_c }
                if(cc){
                    d.camera_controls.rotateTo(cc.azimuth, cc.polar);
                    d.camera_controls.moveTo(cc.pos.x, cc.pos.y, cc.pos.z);
                    d.camera_controls.zoomTo(cc.zoom);
                    d.cam_info = {matrix: cc.matrix, dir:cc.dir};
                }else{
                    d.camera_controls.rotateTo(0,Math.PI/2);
                    d.camera_controls.moveTo(0,0,0);
                    d.camera_controls.zoomTo(1);
                }
                d.camera_controls.dollyTo(1000);
            }
        });
    },[studio_mode]);
    useEffect(()=>{
        rs(d=> d.scene = scene);
        scene.add(camera);
        camera.add(light.current);
    },[]);
    //console.log('render viewport');
    return (
        c('group', {name:'viewport'}, 
            c(Viewport_Control),
            studio_mode=='graph'  && c(Graph),
            studio_mode=='design' && c(Design),
            c(Board),
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
    )
}

export function Board(){
    const obj = useRef();
    const {camera} = useThree(); 
    useEffect(()=>{
        camera.add(obj.current);
    },[]);
    //console.log('board render');
    return (
        c('mesh', { 
            ref: obj,
            name: 'board',
            position:[0,0,-2000],
            onClick(e){
                e.stopPropagation();
                ss(d=>{
                    if(!d.studio.gizmo_active && e.delta < d.max_click_delta){
                        d.pick.none(d);
                    }
                    d.studio.gizmo_active = false;
                });
                
            },
        },   
            c('planeGeometry', {args:[20000, 20000],}),
            c('meshBasicMaterial', {color:theme.bg_body, toneMapped:false}), // theme.bg_body
        )
    )
}


