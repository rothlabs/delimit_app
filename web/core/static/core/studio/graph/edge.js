import {createElement as r, useState, useEffect, useRef, useMemo} from 'react';
import {MeshLineRaycast } from '../meshline.js';
import {useThree, useFrame} from 'r3f';
import {theme, static_url, use_effect} from '../../app.js';


export function Edge({source, tag, target}){
    const {camera} = useThree();
    const meshline = useRef();
    const meshline_material = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const source_pos = useRef(); // <<<< -------------- useRef to remember last pos and check if different this time to set points
    //const points = useMemo(()=> {
    //    return new Float32Array([source.pos.x,source.pos.y,source.pos.z-100, target.pos.x,target.pos.y,target.pos.z-100]);
    //},[source.pos, target.pos]);
    useFrame(()=> {
        meshline.current.setPoints([source.pos.x,source.pos.y,source.pos.z-100, target.pos.x,target.pos.y,target.pos.z-100]);
        meshline_material.current.lineWidth = 2 / camera.zoom;
    }); 
    return(
        r('group', {name: 'edge'}, 
            r('mesh', { 
                //ref: mesh, 
                raycast: MeshLineRaycast,
                onClick: (e)=> set_active(true),
                onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                onPointerOver: (e)=> set_hover(true),
                onPointerOut: (e)=> set_hover(false),
            },
                r('meshLine', {ref:meshline, attach:'geometry'}), //, points:points
                r('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            ),
        )
    )
}