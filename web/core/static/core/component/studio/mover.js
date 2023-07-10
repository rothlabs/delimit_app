import {createElement as c, useRef, useState, useEffect} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {useS, gs, ss, fs, sf, mf} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

// save starting state and then rebase to that and ss(d=> set_final_pos);

export function Mover(){
    //const studio_mode = useS(d=> d.studio.mode);
    //const move_mode = useS(d=> d.design.move_mode);
    //const pick_count = useS(d=> d.pick.n.length);
    const mover = useS(d=> d.design.mover);
    //const show 
    const [matrix, set_matrix] = useState(new THREE.Matrix4()); // keep this in d.design
    //console.log('render mover ', studio_mode, move_mode, pick_count, mover);
    const d = gs();
    return (
        mover.show && c(PivotControls, { 
            offset:[mover.pos.x, mover.pos.y, mover.pos.z], 
            axisColors: d.axis_colors,
            activeAxes: [true, true, false],
            scale:120,
            depthTest:false,
            fixed:true,
            lineWidth:3,
            onDragStart:e=> fs(d=>{ 
                d.design.pin_move(d);
                d.design.moving = true;
                d.studio.gizmo_active = true;
            }),
            onDrag:e=> {
                set_matrix(e);
                sf(d=> d.design.move(d,e));
            },
            onDragEnd:()=> mf(d=>{ if(d){
                    d.design.move(d, matrix); 
                    d.design.moving = false;
            }}),
        })
    )
}


//const reset = useS(d=> d.design.mover_reset);

//const [show, set_show] = useState(true);
    //useEffect(()=>{
    //    if(reset) set_show(false);
        //set_show(false);
    //},[reset]);
    //useEffect(()=>{
    //    if(!show) set_show(true);
    //},[show]);
    //set_show(true);