import {createElement as r, useState, useEffect, useRef, useMemo} from 'react';
import {MeshLineRaycast } from '../meshline.js';
import {useThree, useFrame} from 'r3f';
import {theme, static_url, Fixed_Size_Group, uppercase, use_nodes} from '../../app.js';
import {useReactiveVar} from 'apollo';
import {camera_zoom_rv} from '../viewport.js';
import {Text} from 'drei';


export function Edge({source, tag, target}){
    const meshline = useRef();
    const meshline_material = useRef();
    const text = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const camera_zoom = useReactiveVar(camera_zoom_rv);
    useEffect(()=>{
        meshline_material.current.lineWidth = 1.5 / camera_zoom;
    },[camera_zoom]);
    function sync(){
        meshline.current.setPoints([source.pos.x,source.pos.y,source.pos.z-100, target.pos.x,target.pos.y,target.pos.z-100]);
        text.current.obj.position.copy(source.pos).add(target.pos).multiplyScalar(.5).setZ(target.pos.z-90);
    }
    use_nodes([source, target], sync);
    return(
        r('group', {
            name: 'edge',
            onClick: (e)=> set_active(true),
            onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
            onPointerOver: (e)=> set_hover(true),
            onPointerOut: (e)=> set_hover(false),
        }, 
            r('mesh', { 
                raycast: MeshLineRaycast,
            },
                r('meshLine', {
                    ref: meshline, 
                    attach: 'geometry', 
                }), 
                r('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            ),
            r(Fixed_Size_Group, {
                ref: text,
                size: active ? 18 : 13,
            },
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    uppercase(tag),
                    r('meshBasicMaterial', {color: active||hover? theme.primary : theme.secondary, toneMapped:false}),
                ),
            ),
        )
    )
}