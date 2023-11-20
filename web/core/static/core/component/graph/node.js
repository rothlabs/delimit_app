import {createElement as r, memo, useRef} from 'react';
import {useS, gs, useSub, readable} from '../../app.js';
//import {Text} from '@react-three/drei/Text';
//import {Edges} from '@react-three/drei/Edges';
//import {Edge} from './edge.js';
import * as THREE from 'three';
import { Pickable } from '../node/base.js';
import {Svg} from '@react-three/drei/Svg';
import {View_Transform} from '../node/base.js';

export const circle_size = 1.25;
const circle_geometry = new THREE.CircleGeometry(circle_size,16); // do this for the other geometries as well for reuse
const background_material = new THREE.MeshBasicMaterial({color: 'white', toneMapped:false});
//const tv = new THREE.Vector3();

export const Node = memo(({node})=>{ 
    const obj = useRef();
    const name  = useS(d=> d.face.name(d, node));
    const tag   = useS(d=> d.face.tag(d, node));
    const icon  = useS(d=> d.face.icon(d, node));
    const color = useS(d=> d.face.color.secondary(d, node));
    useSub(d=> d.graph.node.get(node).pos, pos=>{ //useSub(d=> d.n[n].graph, graph=>{//useEffect(()=>useD.subscribe(d=>({   pos:d.n[n].graph.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[n].num, 
        obj.current.position.copy(pos);
    }); 
    const d = gs();
    const material = {color, toneMapped:false};
    //console.log('render part');
    return(
        r('group', {name: 'part'}, 
            r(View_Transform, {
                ref: obj,
                size: 20, //pick ? 25 : 20, // 1.5 : 1, adjust size of other items
            },
                r('text', {
                    font: d.base_font, 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, 1.4, 2],
                    outlineWidth: '40%',
                    outlineColor: 'white',
                    anchorX: 'center',
                    anchorY: 'middle',
                    text: name,
                },
                    r('meshBasicMaterial', material), // causing unsupported texture colorspace: undefined
                ),
                r(Svg, {
                    src: icon,
                    scale: 0.1,
                    position: [-0.8, 0.8, 1],
                    fillMaterial: material,
                    strokeMaterial: material,
                }),
                r('text', {
                    font: d.base_font, 
                    fontSize: 0.75, //letterSpacing: 0, lineHeight: 1, 
                    position: [0, -1.4, 2],
                    outlineWidth: '40%',
                    outlineColor: 'white',
                    anchorX: 'center',
                    anchorY: 'middle',
                    text: tag,//d.spec.tag(d,n), //readable(d.n[n].t),//
                },
                    r('meshBasicMaterial', material), // causing unsupported texture colorspace: undefined
                ),
                r(Pickable, {node},
                    r('mesh', {
                        //position:[0,0,0], 
                        geometry: circle_geometry,
                        material: background_material, //raycast:()=>null,
                    }),
                )
            )
        )
    )
})


                // icon ? 
                //     r(Svg, {
                //         src: icon,
                //         scale: 0.1,
                //         position: [-0.8, 0.8, 0],
                //         fillMaterial: material,
                //         strokeMaterial: material,
                //     }) :
                //     r(Spinner, {}, 
                //         r('mesh', {},
                //             r('icosahedronGeometry'),
                //             r('meshBasicMaterial', {color: color[1], toneMapped:false}),
                //             r(Edges, {scale:1.05, color: color[2]}),
                //         )
                //     ),

// r(Spinner, {}, 
                //     r('mesh', {},
                //         r('icosahedronGeometry'),
                //         r('meshBasicMaterial', {color: color[1], toneMapped:false}),
                //         r(Edges, {scale:1.05, color: color[2]}),
                //     )
                // ),


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