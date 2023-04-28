import {createElement as r, useState, useRef, useMemo, useEffect} from 'react';
import {useFrame} from 'r3f';
//import {pack_rv} from '../studio.js';
import {theme, static_url, Spinner, Fixed_Size_Group, uppercase, use_effect} from '../../app.js';
import {Text, Edges} from 'drei';
import {Edge} from './edge.js';
import {useReactiveVar} from 'apollo';
import {equilibrium_rv} from './graph.js';
import * as THREE from 'three';

const circle_size = 1.25;
const circle_geometry = new THREE.CircleGeometry(circle_size,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});
const tv = new THREE.Vector3();

export function Part({part}){
    const obj = useRef();
    const arrows = useRef({});
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const equilibrium = useReactiveVar(equilibrium_rv);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    function update_arrows(){
        Object.entries(arrows.current).forEach(([key, arrow]) => {
            arrow.obj.position.copy(arrow.target.pos).sub(part.pos).normalize().multiplyScalar(circle_size+0.4);
            arrow.obj.lookAt(part.pos);
            arrow.obj.rotateX(1.5708);
        });
    }
    useFrame(()=>{
        if(!equilibrium) {
            obj.current.obj.position.copy(part.pos);
            update_arrows();
        }
    });
    useEffect(()=>{
        update_arrows();
    },[]);
    return(
        r('group', {name: 'part'}, 
            ...Object.entries(part.e1).map(([key, tag_group], i)=> 
                tag_group.map((target, k)=>
                    r(Edge, {source:part, tag:key, target:target, key:i+'_'+k}),
                )
            ),
            r(Fixed_Size_Group, {
                ref: obj,
                size: active ? 35 : 25,
                props: {
                    position: [part.pos.x, part.pos.y, part.pos.z],
                },
            },
                part.e1.name && r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.4, 2],
                    outlineWidth: '25%',
                    outlineColor: 'white',
                },
                    part.e1.name[0].v,
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
                    uppercase(part.t), // memoize it?
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
                ...Object.entries(part.e1).map(([key, tag_group], i)=> 
                    tag_group.map((target, k)=>
                        r('mesh', {
                            key: i+'_'+k,
                            ref: rf=>arrows.current[i+'_'+k]={obj:rf, target:target},
                        },
                            r('coneGeometry', {args:[.15,1,16]}),
                            r('meshBasicMaterial', {color: theme.secondary, toneMapped:false}),
                        )
                    )
                ),
            )
        )
    )
}

//myInterval = setInterval(function, milliseconds);
    //console.log('render part');