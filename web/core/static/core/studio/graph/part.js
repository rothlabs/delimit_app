import {createElement as r, useState, useRef} from 'react';
import {useFrame} from 'r3f';
//import {pack_rv} from '../studio.js';
import {theme} from '../../app.js';

export function Part({part}){
    const mesh = useRef();
    useFrame((state, delta) => (mesh.current.rotation.x += delta))
    return(
        r('mesh', {
            ref: mesh, 
            name: 'part', 
            position: [part.x, part.y, 10],
        },
            r('boxGeometry', {args:[1, 1, 1],}),
            r('meshStandardMaterial', {color:theme.primary}),
        )
    )
}