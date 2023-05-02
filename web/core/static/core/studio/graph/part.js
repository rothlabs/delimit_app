import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
import {use_d, shallow} from '../../state/state.js';
import {theme, static_url, Spinner, Fixed_Size_Group, uppercase} from '../../app.js';
import {Text, Edges} from 'drei';
import {Edge} from './edge.js';
import * as THREE from 'three';

export const circle_size = 1.25;
const circle_geometry = new THREE.CircleGeometry(circle_size,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});

export function Part({id}){ 
    const obj = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    const name = use_d(d=> d.n[id].e1.name ? d.n[d.n[id].e1.name[0]].v : null);
    const tag = use_d(d=> uppercase(d.n[id].t));
    const e1 = use_d(d=> Object.keys(d.n[id].e1).map(t=>d.n[id].e1[t].map(n=>t+'__'+n)).flat(1), shallow);
    const pos = use_d(d=> d.n[id].vis.pos);
    useEffect(() => use_d.subscribe(d=> ({    pos:d.n[id].vis.pos    }), d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount //({pos:d.n[id].pos, num:d.n[id].num})
        obj.current.obj.position.copy(d.pos);
    },{fireImmediately:true}), []); // { equalityFn: (old_pos,new_pos)=> old_pos.distanceTo(new_pos)<0.001}  ,{equalityFn:shallow}
    //console.log('render part');
    return(
        r('group', {name: 'part'}, 
            ...e1.map(e=> 
                id != e.split('__')[1] && r(Edge, {id1:id, tag:e.split('__')[0], id2:e.split('__')[1], key:e.split('__')[1]})
            ),
            r(Fixed_Size_Group, {
                ref: obj,
                size: active ? 35 : 25, // 1.5 : 1, adjust size of other items
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
            )
        )
    )
}


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