import {createElement as r, useState, useRef, useMemo} from 'react';
import {useFrame, useThree} from 'r3f';
//import {pack_rv} from '../studio.js';
import {theme, static_url, Spinner, Fixed_Size} from '../../app.js';
import {Text} from 'drei';

export function Part({part}){
    //const {camera} = useThree();
    const mesh = useRef();
    //const group = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    //useFrame((state, delta) => {
        //fix_size(group);
        //group.current.scale.set((active? 15 : 10));
        //console.log(group.current.scale);
        //spin(mesh, delta);
    //});
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    return(
        r(Fixed_Size, {
            size: active ? 40 : 30,
            group_props: {position: [part.x, part.y, 10]},
        },
            r(Text, {
                font: static_url+'font/Inter-Bold.ttf', 
                fontSize: 0.6, 
                letterSpacing: 0, 
                lineHeight: 1, 
                'material-toneMapped': false,
                position: [0, 1.2, 0],
            },
                part.t,
                r('meshStandardMaterial', {color: color}),
            ),
            r(Spinner, {}, 
                r('mesh', {
                    ref: mesh, 
                    name: 'part', 
                    onClick: (e)=> set_active(true),
                    onPointerMissed: (e)=> {
                        if(e.which == 1) set_active(false);
                    },
                    onPointerOver: (e)=> set_hover(true),
                    onPointerOut: (e)=> set_hover(false),
                },
                    r('boxGeometry'),//, {args:[1, 1, 1]}),
                    r('meshStandardMaterial', {color: color}),
                )
            )
        )
    )
}