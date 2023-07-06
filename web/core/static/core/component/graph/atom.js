import {createElement as c, memo, useRef} from 'react';
import {useS, useSub, gs, static_url, readable} from '../../app.js';
//import {Text} from '@react-three/drei/Text';
import {Edges} from '@react-three/drei/Edges';
import * as THREE from 'three';
import { Pickable } from '../node/base.js';
import {Spinner, Fix_Size} from '../base/base.js';

const circle_geometry = new THREE.CircleGeometry(1.8,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});

export const Atom = memo(function Atom({n}){
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color);
    const pick = useS(d=> d.n[n].pick.pick); //const pick = useD(d=> d.selection.includes(n));
    //const hover = useS(d=> d.n[n].hover);
    //const color = useMemo(()=> pick||hover? theme.primary : theme.secondary, [pick, hover]);
    const val = useS(d=> ''+d.n[n].v);
    const tag = useS(d=> d.n[n].t); //d.tag(n)
    //const pos = useS(d=> d.n[n].graph.pos); // can i remove?!!!
    useSub(d=> d.n[n].graph, graph=>{//useEffect(()=>useD.subscribe(d=>({   pos:d.n[n].graph.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[n].num, 
        obj.current.position.copy(graph.pos);
    }); 
    //const pos = gs().n[n].graph.pos

    // useEffect(()=>subS(d=> d.n[n].graph, d=>{//useEffect(()=>useD.subscribe(d=>({   pos:d.n[n].graph.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[n].num, 
    //     obj.current.obj.position.copy(d.pos);
    // }),[]); 
    //console.log('render atom');
    return(
        c('group', {name: 'atom'}, 
            c(Fix_Size, {
                ref: obj,
                size: pick ? 25 : 20,
            },
                // c(Text, {
                //     font: static_url+'font/Inter-Medium.ttf', 
                //     fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                //     position: [0, 1.35, 2],
                //     outlineWidth: '25%',
                //     outlineColor: 'white',
                // },
                //     val,
                //     c('meshBasicMaterial', {color: color[0], toneMapped:false}),// causing unsupported texture colorspace: undefined
                // ),
                c(Spinner, {position:[0,0,1]}, 
                    c('mesh', {},
                        c('tetrahedronGeometry'),
                        c('meshBasicMaterial', {color: color[1], toneMapped:false}),
                        c(Edges, {scale:1.05, color: color[2]},),
                    )
                ),
                // c(Text, {
                //     font: static_url+'font/Inter-Medium.ttf', 
                //     fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                //     position: [0, -1.35, 2],
                //     outlineWidth: '25%',
                //     outlineColor: 'white',
                // },
                //     readable(tag),
                //     c('meshBasicMaterial', {color: color[0], toneMapped:false}),// causing unsupported texture colorspace: undefined
                // ),
                c(Pickable, {n:n},
                    c('mesh', {
                        geometry: circle_geometry,
                        material: background_material,
                    }),
                ),
            )
        )
    )
})

                    // c('mesh', {},
                    //     c('tetrahedronGeometry'),
                    //     c('meshStandardMaterial', {color: color}),
                    // )