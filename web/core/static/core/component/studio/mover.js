import {createElement as c, useRef, useState, useEffect} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {use_store, get_store, fork_store, set_fork, merge_fork} from 'delimit';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

// save starting state and then rebase to that and ss(d=> set_final_pos);



export function Mover(){
    //const obj = useRef();
    //const studio_mode = use_store(d=> d.studio.mode);
    //const move_mode = use_store(d=> d.design.move_mode);
    //const pick_count = use_store(d=> d.pick.n.length);
    const mover = use_store(d=> d.design.mover);
    //const show 
    const [matrix, set_matrix] = useState(new THREE.Matrix4()); // keep this in d.design
    //console.log('render mover ', studio_mode, move_mode, pick_count, mover);

    // useFrame((state)=>{
    //     if(obj.current){
    //         // if(face_camera){
    //         //     obj.current.lookAt(state.camera.position);
    //         // }
    //     }
    // });

    const d = get_store();
    //const mtx = new THREE.Matrix4();
    return (
        mover.show && c(PivotControls, { 
            //ref: obj,
            offset:[mover.pos.x, mover.pos.y, mover.pos.z], 
            axisColors: d.axis_colors,
            activeAxes: mover.active_axes,
            scale:120,
            depthTest:false,
            fixed:true,
            lineWidth:3,
            /////rotation: [mover.rot.x, mover.rot.y, mover.rot.z],
            //autoTransform: false,
            //matrix: mtx,
            onDragStart:e=> fork_store(d=>{ 
                //d.design.res = 'low';
                d.design.pin_move(d);
                d.design.act = 'moving'; //d.design.moving = true;
                d.studio.gizmo_active = true;
            }),
            onDrag:e=> {
                set_matrix(e);
                //mtx.copy(e);
                set_fork(d=> d.design.move(d,e));
            },
            onDragEnd:()=> merge_fork(d=>{ if(d){
                //d.design.res = 'high';
                d.design.move(d, matrix); 
                d.design.act = null; //d.design.moving = false;
            }}),
        })
    )
}


//const reset = use_store(d=> d.design.mover_reset);

//const [show, set_show] = useState(true);
    //useEffect(()=>{
    //    if(reset) set_show(false);
        //set_show(false);
    //},[reset]);
    //useEffect(()=>{
    //    if(!show) set_show(true);
    //},[show]);
    //set_show(true);