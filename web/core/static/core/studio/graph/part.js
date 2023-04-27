import {createElement as r, useState, useRef, useMemo} from 'react';
//import {useFrame, useThree} from 'r3f';
//import {pack_rv} from '../studio.js';
import {theme, static_url, Spinner, Fixed_Size} from '../../app.js';
import {Text} from 'drei';
import {Edge} from './edge.js';

export function Part({part}){
    const mesh = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    return(
        r('group', {name: 'part'}, 
            ...Object.entries(part.e1).map(([key, tag_group], i)=> 
                tag_group.map((target, i)=>
                    r(Edge, {source:part, tag:key, target:target, key:i})
                )
            ),
            r(Fixed_Size, {
                size: active ? 40 : 30,
                group_props: {
                    position: [part.x, part.y, 10],
                    onClick: (e)=> set_active(true),
                    onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                    onPointerOver: (e)=> set_hover(true),
                    onPointerOut: (e)=> set_hover(false),
                },
            },
                part.e1.name && r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.6, //letterSpacing: 0, lineHeight: 1, //'material-toneMapped': false,
                    position: [0, 1.2, 0],
                },
                    part.e1.name[0].v,
                    r('meshStandardMaterial', {color: color}),
                ),
                r(Spinner, {}, 
                    r('mesh', {ref: mesh, },
                        r('boxGeometry'),//, {args:[1, 1, 1]}),
                        r('meshStandardMaterial', {color: color}),
                    )
                ),
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.6, //letterSpacing: 0, lineHeight: 1, //'material-toneMapped': false,
                    position: [0, -1.2, 0],
                },
                    part.t,
                    r('meshStandardMaterial', {color: color}),
                ),
            )
        )
    )
}