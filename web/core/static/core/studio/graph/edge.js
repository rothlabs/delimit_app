import {createElement as r, useState, useEffect, useRef, useMemo} from 'react';
import {MeshLineRaycast } from '../meshline.js';
import {useThree, useFrame} from 'r3f';
import {theme, static_url, Fixed_Size_Group, uppercase} from '../../app.js';
import {useReactiveVar} from 'apollo';
import {equilibrium_rv} from './graph.js';
import {camera_zoom_rv} from '../viewport.js';
import {Text} from 'drei';


export function Edge({source, tag, target}){
    const meshline = useRef();
    const meshline_material = useRef();
    const text = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const equilibrium = useReactiveVar(equilibrium_rv);
    const camera_zoom = useReactiveVar(camera_zoom_rv);
    useFrame(()=> {
        if(!equilibrium) {
            meshline.current.setPoints([source.pos.x,source.pos.y,source.pos.z-100, target.pos.x,target.pos.y,target.pos.z-100]);
            text.current.obj.position.x = (source.pos.x + target.pos.x) / 2; // setX?
            text.current.obj.position.y = (source.pos.y + target.pos.y) / 2;
        }
    }); 
    useEffect(()=>{
        meshline_material.current.lineWidth = 1.5 / camera_zoom;
    },[camera_zoom]);
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
                    points: [source.pos.x,source.pos.y,source.pos.z-100, target.pos.x,target.pos.y,target.pos.z-100],
                }), 
                r('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            ),
            r(Fixed_Size_Group, {
                ref: text,
                size: 13,//active ? 25 : 18,
                props: {
                    position: [(source.pos.x+target.pos.x)/2, (source.pos.y+target.pos.y)/2, source.pos.z-90],
                },
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
            // r(Fixed_Size_Group, {
            //     ref: arrow,
            //     size: 10,
            //     props: {
            //         position: [(source.pos.x+target.pos.x)/2, (source.pos.y+target.pos.y)/2, source.pos.z-90],
            //     },
            // },

            // ),
        )
    )
}