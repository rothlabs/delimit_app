import {createElement as c, useRef, useState, useEffect} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {useS, ss, fs, sf, mf} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

// save starting state and then rebase to that and ss(d=> set_final_pos);

export function Mover(){
    const studio_mode = useS(d=> d.studio.mode);
    const move_mode = useS(d=> d.design.move_mode);
    const pick_count = useS(d=> d.pick.nodes.length);
    const mover = useS(d=> d.design.mover);
    //const reset = useS(d=> d.design.mover_reset);
    const [matrix, set_matrix] = useState(new THREE.Matrix4());
    //const [show, set_show] = useState(true);
    //useEffect(()=>{
    //    if(reset) set_show(false);
        //set_show(false);
    //},[reset]);
    //useEffect(()=>{
    //    if(!show) set_show(true);
    //},[show]);
    //set_show(true);
    //console.log('render mover ', mover);
    return (
        pick_count>0 && c(PivotControls, { //&& Date.now()-reset>50
            //autoTransform: false,
            offset:[mover.pos.x, mover.pos.y, mover.pos.z], 
            visible: studio_mode=='design' && move_mode=='move',
            activeAxes:[true, true, false],
            scale:120,
            depthTest:false,
            fixed:true,
            lineWidth:3,
            //matrix:matrix,
            onDragStart:e=> fs(d=> d.design.pin_move(d)),
            onDrag:e=> {
                set_matrix(e);
                sf(d=> d.design.move(d,e));
            },
            onDragEnd:()=> mf(d=> d.design.move(d, matrix)),
        })
    )
}
