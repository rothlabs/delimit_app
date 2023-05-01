import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
import {useFrame} from 'r3f';
import {use_store} from '../studio.js';
import {theme, static_url, Spinner, Fixed_Size_Group, uppercase, use_nodes} from '../../app.js';
import {Text, Edges} from 'drei';
import {Edge} from './edge.js';
//import {useReactiveVar} from 'apollo';
//import {equilibrium_rv} from './graph.js';
import * as THREE from 'three';
//import {shallow} from 'shallow';

const circle_size = 1.25;
const circle_geometry = new THREE.CircleGeometry(circle_size,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});



export function Part({id}){ 
    const name = use_store((d)=> d.n[id].e1.name ? d.n[d.n[id].e1.name[0]].v : null);
    const tag = use_store((d)=> d.n[id].t);
    //const pos = use_store(d=> d.n[id].pos);
    //const nodes = use_store((d)=> d.n);
    //const pos_x = use_store((d)=> d.n[id].pos.x);
    //const pos_y = use_store((d)=> d.n[id].pos.y);
    //const pos_z = use_store((d)=> d.n[id].pos.z);
    const obj = useRef();
    const arrows = useRef({});
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    //useFrame(()=>{
        //var x = use_store.getState().n[id].pos.x;
    //    console.log(use_store.getState().n);
    //});
    useEffect(() => use_store.subscribe(d=> ({num:d.n[id].num, pos:d.n[id].pos}), d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount //({pos:d.n[id].pos, num:d.n[id].num})
        console.log('part pos update');
        obj.current.obj.position.copy(d.pos);
        // Object.values(arrows.current).forEach(arrow=> {
        //     arrow.obj.position.copy(arrow.target.pos).sub(d.n[id].pos).normalize().multiplyScalar(circle_size+0.4);
        //     arrow.obj.lookAt(d.n[id].pos);
        //     arrow.obj.rotateX(1.5708);
        // });
    }), []); // { equalityFn: (old_pos,new_pos)=> old_pos.distanceTo(new_pos)<0.001}  ,{equalityFn:shallow}
    console.log('render part');
    return(
        r('group', {name: 'part'}, 
            // ...Object.entries(part.e1).map(([key, tag_group], i)=> 
            //     tag_group.map((target, k)=>
            //         r(Edge, {source:part, tag:key, target:target, key:i+'_'+k}),
            //     )
            // ),
            r(Fixed_Size_Group, {
                ref: obj,
                size: active ? 35 : 25,
                //props:{
                //    position: [pos.x,pos.y,pos.z],
                //}
            },
                name && r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.4, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    name,
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
                    tag, // memoize it?
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
                r('mesh', {
                    position:[0,0,-1], 
                    geometry: circle_geometry,
                    material: background_material, //raycast:()=>null,
                    onClick: (e)=> {e.stopPropagation(); set_active(true);},
                    onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
                    onPointerOver: (e)=> {e.stopPropagation(); set_hover(true);},
                    onPointerOut: (e)=> {e.stopPropagation(); set_hover(false)},
                }),
                // ...Object.entries(part.e1).map(([key, tag_group], i)=> 
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
            )
        )
    )
}


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