import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
import {useFrame} from 'r3f';
//import {pack_rv} from '../studio.js';
import {theme, static_url, Spinner, Fixed_Size_Group, uppercase, use_effect} from '../../app.js';
import {Text, Edges} from 'drei';
import {Edge} from './edge.js';

export function Part({part}){
    const obj = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    useFrame(()=>{
        obj.current.obj.position.copy(part.pos);
    });
    //console.log('render part');
    return(
        r('group', {name: 'part'}, 
            ...Object.entries(part.e1).map(([key, tag_group], i)=> 
                tag_group.map((target, i)=>
                    r(Edge, {source:part, tag:key, target:target, key:i})
                )
            ),
            r(Fixed_Size_Group, {
                ref: obj,
                size: active ? 35 : 25,
                // props: {
                //     onClick: (e)=> {e.stopPropagation(); set_active(true);},
                //     onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                //     onPointerOver: (e)=> {e.stopPropagation(); set_hover(true);},
                //     onPointerOut: (e)=> {e.stopPropagation(); set_hover(false)},
                // },
            },
                part.e1.name && r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.4, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    part.e1.name[0].v,
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r(Spinner, {}, 
                    r('mesh', {},
                        r('icosahedronGeometry'),
                        r('meshBasicMaterial', {color: active||hover? theme.primary : 'white', toneMapped:false}),
                        r(Edges, {scale:1.05, color:active||hover? 'white' : theme.primary},),
                    )
                ),
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.4, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    uppercase(part.t), // memoize it?
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r('mesh', {
                    position:[0,0,-1], 
                    //raycast:()=>null,
                    onClick: (e)=> {e.stopPropagation(); set_active(true);},
                    onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                    onPointerOver: (e)=> {e.stopPropagation(); set_hover(true);},
                    onPointerOut: (e)=> {e.stopPropagation(); set_hover(false)},
                },
                    r('circleGeometry', {args:[1.25,20]}),
                    r('meshBasicMaterial', {color: 'white', toneMapped:false}),
                )
            )
        )
    )
}