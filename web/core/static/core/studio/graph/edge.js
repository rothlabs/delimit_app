import {createElement as r, useState, useRef, useMemo} from 'react';
import {MeshLineRaycast } from '../meshline.js';
import {useThree, useFrame} from 'r3f';
import {theme, static_url} from '../../app.js';


export function Edge({source, tag, target}){
    const {camera} = useThree();
    const meshline = useRef();
    const meshline_material = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    //const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    const points = useMemo(()=> 
        new Float32Array([source.x,source.y,source.z,target.x,target.y,target.z]),
    [source.x,source.y,source.z,target.x,target.y,target.z]);
    useFrame(()=> {
        meshline_material.current.lineWidth = 3 / camera.zoom;
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
                r('meshLine', {ref:meshline, attach:'geometry', points:points}),
                r('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            ),
        )
    )
}