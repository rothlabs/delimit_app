import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {PivotControls} from '@react-three/drei/PivotControls';
import {Part} from './part.js';
import {useS, ss} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';

export function Handle(){

    return (
        c(PivotControls, {
            rotation:[0, 0, 0], //[0, -Math.PI / 2, 0]
            anchor:[0, 0, 0],
            scale:100,
            depthTest:false,
            fixed:true,
            lineWidth:2,
        },
            c('mesh', {},
                c('boxGeometry'),
                c('meshBasicMaterial', {color:'grey', toneMapped:false}),
            )
        )
    )
}
