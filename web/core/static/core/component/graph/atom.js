import {createElement as c, useState, useRef, useMemo, useEffect} from 'react';
import {useS, subS, theme, static_url, Spinner, Fixed_Size_Group, readable} from '../../app.js';
import {Text} from '@react-three/drei/Text';
import {Edges} from '@react-three/drei/Edges';
import * as THREE from 'three';
import { Pickable } from '../node/base.js';

const circle_geometry = new THREE.CircleGeometry(1.8,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});

export function Atom({n}){
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color);
    const picked = useS(d=> d.n[n].pick.picked); //const picked = useD(d=> d.selection.includes(n));
    //const hover = useS(d=> d.n[n].hover);
    //const color = useMemo(()=> picked||hover? theme.primary : theme.secondary, [picked, hover]);
    const val = useS(d=> ''+d.n[n].v);
    const tag = useS(d=> d.n[n].t); //d.tag(n)
    const pos = useS(d=> d.n[n].graph.pos); // can i remove?!!!
    useEffect(()=>subS(d=> d.n[n].graph, d=>{//useEffect(()=>useD.subscribe(d=>({   pos:d.n[n].graph.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[n].num, 
        obj.current.obj.position.copy(d.pos);
    }),[]); 
    //console.log('render atom');
    return(
        c('group', {name: 'atom'}, 
            c(Fixed_Size_Group, {
                ref: obj,
                size: picked ? 30 : 20,
                props:{
                    position: [pos.x, pos.y, pos.z],
                }
            },
                c(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    val,
                    c('meshBasicMaterial', {color: color[0], toneMapped:false}),// causing unsupported texture colorspace: undefined
                ),
                c(Spinner, {}, 
                    c('mesh', {},
                        c('tetrahedronGeometry'),
                        c('meshBasicMaterial', {color: color[1], toneMapped:false}),
                        c(Edges, {scale:1.05, color: color[2]},),
                    )
                ),
                c(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.35, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    readable(tag),
                    c('meshBasicMaterial', {color: color[0], toneMapped:false}),// causing unsupported texture colorspace: undefined
                ),
                c(Pickable, {n:n},
                    c('mesh', {
                        position: [0,0,-1],
                        geometry: circle_geometry,
                        material: background_material,
                        // onClick: (e)=> {e.stopPropagation(); select(n, true);},
                        // onPointerMissed: (e)=> {if(e.which == 1) select(n, false);},
                        // onPointerOver: (e)=> {e.stopPropagation(); set_hovec(true);},
                        // onPointerOut: (e)=> {e.stopPropagation(); set_hovec(false)},
                    }),
                ),
            )
        )
    )
}

                    // c('mesh', {},
                    //     c('tetrahedronGeometry'),
                    //     c('meshStandardMaterial', {color: color}),
                    // )