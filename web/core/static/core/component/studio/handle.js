import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {Part} from './part.js';
import {useS, ss, ssl} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';

//const matrix = new THREE.Matrix4()
//const vect = new THREE.Vector3()
export function Handle(){
    //const pin = useS(d=> d.pick.pin);
    //console.log('render console');
    return (
        c(PivotControls, {
            rotation:[0, 0, 0], //[0, -Math.PI / 2, 0]
            anchor:[0, 0, 0],
            scale:100,
            depthTest:false,
            fixed:true,
            lineWidth:2,
            //matrix:pin.matrix,
            onDragStart:e=> ssl(d=> d.pick.start_drag(d,e)),
            onDrag:e=> ssl(d=> d.pick.drag(d,e)),
            onDragEnd:()=> { },
                //console.log(e.elements);
                //vect.applyMatrix4(e);
                //console.log(vect);
                //matrix.set(...e.elements);
                //matrix.copy(e);
            //},
        },
            c('mesh', {},
                c('boxGeometry'),
                c('meshBasicMaterial', {color:'grey', toneMapped:false}),
            )
        )
    )
}
