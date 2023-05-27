import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {Part} from './part.js';
import {useS, ss, ssl} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

export function Handle(){
    return (
        c(PivotControls, {
            //rotation:[0, 0, 0], //[0, -Math.PI / 2, 0]
            //anchor:[0, 0, 0],
            scale:120,
            depthTest:false,
            fixed:true,
            lineWidth:2,
            onDragStart:e=> ssl(d=> d.pick.start_drag(d,e)),
            onDrag:e=> ssl(d=> d.pick.drag(d,e)),
            onDragEnd:()=> ss(d=> d.pick.end_drag(d)),
        },
            c('mesh', {},
                c('boxGeometry'),
                c('meshBasicMaterial', {color:'grey', toneMapped:false}),
            )
        )
    )
}
