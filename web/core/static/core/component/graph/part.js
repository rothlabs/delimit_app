import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
//import {use_d, shallow} from '../../state/state.js';
import {useS, useSS, subS, theme, static_url, Spinner, Fixed_Size_Group, readable} from '../../app.js';
import {Text} from '@react-three/drei/Text';
import {Edges} from '@react-three/drei/Edges';
//import {Edge} from './edge.js';
import * as THREE from 'three';
import { Pickable } from '../node/base.js';

export const circle_size = 1.25;
const circle_geometry = new THREE.CircleGeometry(circle_size,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});
//const tv = new THREE.Vector3();

export function Part({n}){ 
    const d = useS.getState();
    const pos = d.n[n].graph.pos; 
    const name = useS(d=> d.n[n].c.name);
    const tag = useS(d=> d.n[n].t);
    const color = useS(d=> d.n[n].pick.color);
    const picked = useS(d=> d.n[n].pick.picked); 
    const obj = useRef();
    useEffect(()=> subS(d=> d.n[n].graph, d=>{ //useEffect(()=> subscribe(d=> d.xyz(d.n[id].graph.pos), pos=>{ 
        obj.current.obj.position.copy(d.pos);
        //console.log('update part pos');
    }), []);
    //console.log('render part');
    return(
        r('group', {name: 'part'}, 
            r(Fixed_Size_Group, {
                ref: obj,
                size: picked ? 30 : 20, // 1.5 : 1, adjust size of other items
                props:{
                    position: [pos.x, pos.y, pos.z],
                }
            },
                name && r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.4, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    name,
                    r('meshBasicMaterial', {color: color[0], toneMapped:false}), // causing unsupported texture colorspace: undefined
                ),
                r(Spinner, {}, 
                    r('mesh', {},
                        r('icosahedronGeometry'),
                        r('meshBasicMaterial', {color: color[1], toneMapped:false}),
                        r(Edges, {scale:1.05, color: color[2]}),
                    )
                ),
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.4, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    readable(tag), // memoize it?
                    r('meshBasicMaterial', {color: color[0], toneMapped:false}), // causing unsupported texture colorspace: undefined
                ),
                r(Pickable, {n:n},
                    r('mesh', {
                        position:[0,0,-1], 
                        geometry: circle_geometry,
                        material: background_material, //raycast:()=>null,
                    }),
                )
            )
        )
    )
}


//const edge_tags = useDS(d=> d.graph.node_edges(id).map(e=>e.t));
    //const edge_nodes = useDS(d=> d.graph.node_edges(id).map(e=>e.n));
//...edge_nodes.map((n,i)=> 
            //    r(Edge, {id1:id, tag:edge_tags[i], id2:n, key:n+edge_tags[i]}) // .split('__')  // id != e[1] && d.n[e[1]] && 
            //),


//({x:d.n[id].graph.pos.x, y:d.n[id].graph.pos.y, z:d.n[id].graph.pos.z})

// useEffect(() => useD.subscribe(d=> ({x:d.n[id].graph.pos.x, y:d.n[id].graph.pos.y, z:d.n[id].graph.pos.z}), pos=>{ // returns an unsubscribe func to useEffect as cleanup on unmount //({pos:d.n[id].pos, num:d.n[id].num})
//     obj.current.obj.position.set(pos.x, pos.y, pos.z);
//     console.log('update part pos: '+pos);
// },{fireImmediately:true}), []); // { equalityFn: (old_pos,new_pos)=> old_pos.distanceTo(new_pos)<0.001}  ,{equalityFn:shallow}


// ...Object.entries(part.n).map(([key, tag_group], i)=> 
                //     tag_group.map((target, k)=>
                //         r('mesh', {
                //             key: i+'_'+k,
                //             ref: rf=>arrows.current[i+'_'+k]={obj:rf, target:target},
                //         },
                //             r('coneGeometry', {args:[.15,1,16]}),
                //             r('meshBasicMaterial', {color: theme.secondary, toneMapped:false}),
                //         )
                //     )
                // ),


//use_nodes([part], ()=>{
        // obj.current.obj.position.copy(part.pos);
        // Object.entries(arrows.current).forEach(([key, arrow]) => {
        //     arrow.obj.position.copy(arrow.target.pos).sub(part.pos).normalize().multiplyScalar(circle_size+0.4);
        //     arrow.obj.lookAt(part.pos);
        //     arrow.obj.rotateX(1.5708);
        // });
    //});
    //useEffect(() => use_store.subscribe(
    //    state => (scratchRef.current = state.scratches)
    //), []);


//myInterval = setInterval(function, milliseconds);
    //console.log('render part');