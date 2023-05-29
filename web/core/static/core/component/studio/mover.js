import {createElement as c, useRef, useEffect} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {useS, ss, ssl} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

export function Mover(){
    const studio_mode = useS(d=> d.studio.mode);
    const design_mode = useS(d=> d.design.mode);
    const pick_count = useS(d=> d.pick.nodes.length);
    const mover = useS(d=> d.design.mover);
    //console.log('render mover');
    return (
        pick_count>0 && c(PivotControls, {
            offset:[mover.pos.x, mover.pos.y, mover.pos.z], 
            visible: studio_mode=='design' && design_mode=='move',
            activeAxes:[true, true, false],
            scale:120,
            depthTest:false,
            fixed:true,
            lineWidth:3,
            onDragStart:e=> ssl(d=> d.design.pin_move(d,e)),
            onDrag:e=> ssl(d=> d.design.move(d,e)),
            onDragEnd:()=> ss(d=> d.design.end_move(d)),
        })
    )
}
