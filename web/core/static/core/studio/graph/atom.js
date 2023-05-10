import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
import {useD, subD, theme, static_url, Spinner, Fixed_Size_Group, readable} from '../../app.js';
import {Text, Edges} from 'drei';
import * as THREE from 'three';
import { Selectable } from '../../node/basic.js';

const circle_geometry = new THREE.CircleGeometry(1.8,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});

export function Atom({n}){
    const obj = useRef();
    const selected = useD(d=> d.n[n].selected); //const selected = useD(d=> d.selection.includes(n));
    const hover = useD(d=> d.n[n].hover);
    const color = useMemo(()=> selected||hover? theme.primary : theme.secondary, [selected, hover]);
    const val = useD(d=> ''+d.n[n].v);
    const tag = useD(d=> d.n[n].t); //d.tag(n)
    const pos = useD(d=> d.n[n].graph.pos); // can i remove?!!!
    useEffect(()=>subD(d=> d.n[n].graph, d=>{//useEffect(()=>useD.subscribe(d=>({   pos:d.n[n].graph.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[n].num, 
        obj.current.obj.position.copy(d.pos);
    }),[]); 
    //console.log('render atom');
    return(
        r('group', {name: 'atom'}, 
            r(Fixed_Size_Group, {
                ref: obj,
                size: selected ? 25 : 18,
                props:{
                    position: [pos.x, pos.y, pos.z],
                }
            },
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    val,
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r(Spinner, {}, 
                    r('mesh', {},
                        r('tetrahedronGeometry'),
                        r('meshBasicMaterial', {color: selected||hover? theme.primary : 'white', toneMapped:false}),
                        r(Edges, {scale:1.05, color:selected||hover? 'white' : theme.primary},),
                    )
                ),
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    readable(tag),
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r(Selectable, {n:n},
                    r('mesh', {
                        position: [0,0,-1],
                        geometry: circle_geometry,
                        material: background_material,
                        // onClick: (e)=> {e.stopPropagation(); select(n, true);},
                        // onPointerMissed: (e)=> {if(e.which == 1) select(n, false);},
                        // onPointerOver: (e)=> {e.stopPropagation(); set_hover(true);},
                        // onPointerOut: (e)=> {e.stopPropagation(); set_hover(false)},
                    }),
                ),
            )
        )
    )
}

                    // r('mesh', {},
                    //     r('tetrahedronGeometry'),
                    //     r('meshStandardMaterial', {color: color}),
                    // )