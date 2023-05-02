import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
import {theme, static_url, Spinner, Fixed_Size_Group} from '../../app.js';
import {Text, Edges} from 'drei';
import {use_d} from '../../state/state.js';
import * as THREE from 'three';

const circle_geometry = new THREE.CircleGeometry(1.8,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});
const atom_types = {'b':'Switch', 'i':'Integer', 'f':'Decimal', 's':'Text'};

export function Atom({id}){
    const obj = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    const name = use_d((d)=> ''+d.n[id].v);
    const tag = use_d((d)=> atom_types[d.n[id].m]);
    useEffect(()=>use_d.subscribe(d=>({   pos:d.n[id].vis.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[id].num, 
        obj.current.obj.position.copy(d.pos);
    },{fireImmediately:true}),[]); 
    return(
        r('group', {name: 'atom'}, 
            r(Fixed_Size_Group, {
                ref: obj,
                size: active ? 25 : 18,
            },
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    name,
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r(Spinner, {}, 
                    r('mesh', {},
                        r('tetrahedronGeometry'),
                        r('meshBasicMaterial', {color: active||hover? theme.primary : 'white', toneMapped:false}),
                        r(Edges, {scale:1.05, color:active||hover? 'white' : theme.primary},),
                    )
                ),
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    tag,
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r('mesh', {
                    position: [0,0,-1],
                    geometry: circle_geometry,
                    material: background_material,
                    onClick: (e)=> {e.stopPropagation(); set_active(true);},
                    onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                    onPointerOver: (e)=> {e.stopPropagation(); set_hover(true);},
                    onPointerOut: (e)=> {e.stopPropagation(); set_hover(false)},
                }),
            )
        )
    )
}

                    // r('mesh', {},
                    //     r('tetrahedronGeometry'),
                    //     r('meshStandardMaterial', {color: color}),
                    // )