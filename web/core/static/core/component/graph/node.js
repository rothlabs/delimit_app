import {createElement as c, memo, useRef, useEffect} from 'react';
//import {Text} from '@react-three/drei/Text';
//import {Edges} from '@react-three/drei/Edges';
//import {Edge} from './edge.js';
import * as THREE from 'three';
import {Svg} from '@react-three/drei/Svg';
import {use_store, set_store, get_store, View_Transform, pickable, draggable, droppable} from 'delimit';
import {useThree} from '@react-three/fiber';

export const Node = memo(({node})=>{ 
    //console.log('render node');
    const name_obj  = useRef();
    const type_obj  = useRef();
    const {name, type, icon} = use_store(d=> d.face.primary(d, node));
    const color     = use_store(d=> d.face.color.primary(d, node));
    const material  = use_store(d=> d.face.material.primary(d, node));
    const position  = use_store(d=> d.graph.node.get(node).pos);
    const {invalidate} = useThree();
    useEffect(()=>{
        name_obj.current.sync(() => invalidate());
        type_obj.current.sync(() => invalidate());
    }, [name, type]);
    const d = get_store();
    const material_props = {color, toneMapped:false};    
    return(
        c(View_Transform, {
            name: 'node',
            position, //[pos.x, pos.y, pos.z],
            size: 14, //pick ? 25 : 20, // 1.5 : 1, adjust size of other items
            ...draggable({stem:node}),
            ...droppable({root:node}),
            ...pickable({node}),
        },
            //c('group', {...pickable}, // c(Pickable, {node},
            
                c('mesh', {
                    geometry: d.geometry.circle,
                    material: d.material.body_bg,
                }),
                c('text', {
                    
                    ref: name_obj,
                    text: name,
                    font: d.font.body, 
                    //fontStyle: font_style,
                    outlineColor: d.color.body_bg,
                    material,
                    fontSize: 1, //letterSpacing: 0, lineHeight: 1, 
                    position: [1.6, .6, 2],
                    outlineWidth: '40%',
                    anchorX: 'left',
                    anchorY: 'middle',
                    
                }),
                c(Svg, {
                    src: 'data:image/svg+xml;utf8,' + icon,
                    fillMaterial: material_props,
                    strokeMaterial: material_props,
                    scale: 0.13,
                    position: [-1, 1, 1],
                }),
                c('text', {
                    ref: type_obj,
                    text: type,
                    font: d.font.body, 
                    outlineColor: d.color.body_bg,
                    material,
                    fontSize: 1, //letterSpacing: 0, lineHeight: 1, 
                    position: [1.6, -.6, 2],
                    outlineWidth: '40%',
                    anchorX: 'left',
                    anchorY: 'middle',
                }),
            //),
        )
    );
});



    //if(name.length > 24) name = name.substring(0, 24);
    //let font_style = 'normal';
    // if(forw_size < 1){
    //     name = 'emtpy';
    //     font_style = 'italic';
    // }


// useSub(d=> d.graph.node.get(node).pos, pos=>{ //useSub(d=> d.n[n].graph, graph=>{//useEffect(()=>useD.subscribe(d=>({   pos:d.n[n].graph.pos   }),d=>{ // returns an unsubscribe func to useEffect as cleanup on unmount   //num:d.n[n].num, 
//     obj.current.position.copy(pos);
// }); 


//c('meshBasicMaterial', material), // causing unsupported texture colorspace: undefined


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