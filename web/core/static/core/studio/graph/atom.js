import {createElement as r, useState, useRef, useMemo} from 'react';
import {useFrame} from 'r3f';
import {theme, static_url, Spinner, Fixed_Size_Group} from '../../app.js';
import {Text} from 'drei';
import {Edge} from './edge.js';

const atom_types = {'b':'Switch', 'i':'Integer', 'f':'Decimal', 's':'Text'};

export function Atom({atom}){
    const obj = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    useFrame(()=>{
        obj.current.obj.position.copy(atom.pos);
    });
    //console.log('render atom');
    return(
        r('group', {name: 'atom'}, 
            // ...Object.entries(atom.e1).map(([key, tag_group], i)=> 
            //     tag_group.map((target, i)=>
            //         r(Edge, {source:atom, tag:key, target:target, key:i})
            //     )
            // ),
            r(Fixed_Size_Group, {
                ref: obj,
                size: active ? 25 : 18,
                props: {
                    position: [atom.pos.x, atom.pos.y, atom.pos.z],
                    onClick: (e)=> {e.stopPropagation(); set_active(true);},
                    onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                    onPointerOver: (e)=> {e.stopPropagation(); set_hover(true);},
                    onPointerOut: (e)=> {e.stopPropagation(); set_hover(false)},
                },
            },
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    ''+atom.v,
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r(Spinner, {}, 
                    r('mesh', {},
                        r('tetrahedronGeometry'),
                        r('meshStandardMaterial', {color: color}),
                    )
                ),
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    atom_types[atom.m],
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r('mesh', {position:[0,0,-1], raycast:()=>null},
                    r('circleGeometry', {args:[1.25,20]}),
                    r('meshBasicMaterial', {color: 'white', toneMapped:false}),
                ),
            )
        )
    )
}