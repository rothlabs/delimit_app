import {createElement as r, useEffect, useRef, useState } from 'react';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import {BufferAttribute} from 'three';
import * as vtx from 'easel/vertex.js';

extend({ MeshLine, MeshLineMaterial }) 

export function Line(p) {
    const mesh = useRef();
    const material = useRef();
    const {camera} = useThree();
    const [selected, set_selected] = useState(false);
    const [verts, set_verts] = useState([]);
    const [act, set_act] = useState({name:''});
    const [constraints, set_constraints] = useState([]);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    useFrame(()=> (material.current.lineWidth = 4 / camera.zoom)); // make this run only on zoom change

    useEffect(()=>{
        if(act.name == 'update'){
            if(act.density){
                set_verts(vtx.set_density(act.verts,1,2));
            }
            if(act.constrain > 0){
                constraints.forEach(constraint =>{
                    constraint.enforce(act.constrain);
                });
            }
            if(act.record){
                p.base.set_act({name:'record'});
            }
        }
    },[act]);

    useEffect(()=>{
        set_verts(p.verts);
    },[p.verts]);

    useEffect(()=>{
        if(p.selection == mesh.current){
            set_selected(true);
        }else{
            set_selected(false); 
        }
    },[p.selection]);

    useEffect(()=>{ 
       if(selected){
            const closest = vtx.closest_to_endpoints(verts, p.mod_verts);
            const new_verts = vtx.map(p.mod_verts, closest.v1, closest.v2);
            const new_verts_2 = vtx.replace(verts, closest.i1, closest.i2, new_verts);
            set_act({name:'update', verts: new_verts_2, density:true, constrain:true, record:true});
       }
	},[p.mod_verts]);

    useEffect(()=>{
        if(p.base.act && p.selection!='off'){
            if(p.base.act.name == 'record'){
                history.verts.splice(history.index);
                history.verts.push(verts);
                if(history.verts.length > 7){
                    history.verts.shift();
                }
                history.index = history.verts.length;
            //}else if(p.base.act.name == 'revert'){
            //    set_verts(history.verts[history.index-1]);
            }else if(p.base.act.name == 'undo'){
                if(history.index-1 > 0){
                    history.index--;
                    set_verts(history.verts[history.index-1]);
                }
            }else if(p.base.act.name == 'redo'){
                if(history.index+1 <= history.verts.length){
                    history.index++;
                    set_verts(history.verts[history.index-1]);
                }
            }
            set_history(history);
        }
    },[p.base.act]);

    return ([
        r('mesh', {
            name: 'line',
            ref: mesh,
            raycast: (p.selection!='off') ? MeshLineRaycast : undefined,
        },[
            r('meshLine', {attach:'geometry', points: verts}),
            r('meshLineMaterial', {ref:material, color:selected?'lightblue':'grey',}),
            //...constraints.map((constraint)=>
        ]),
        (verts.length<6 || p.selection=='off') ? null :
            r('points',{name:'point'},[
                r('bufferGeometry',{},
                    r('bufferAttribute', {attach: 'attributes-position', ...new BufferAttribute(vtx.endpoints(verts,2),3)} )
                ),
                r('pointsMaterial',{color:'hsl(0,50%,40%)', size:10,}),
            ]),
    ])
}

//color:new Color('hsl(0,0%,55%)'),})

// function Line(p) {
//     //const mesh = useRef();
//     //const [vect, set_vect] = useState(new Vector3());
//     //useFrame(() => (console.log(vect)));
//     return r('mesh', {
//         p: p,
//         ref: mesh, 
//         //onPointerMove: (event) => set_vect(event.intersections[0].point),},[ 
//         geometry: new MeshLine(),
//     },[
//             r('planeGeometry', {args:[10000, 10000]}),
//             r('meshBasicMaterial', {color: 'white', toneMapped:false}),
//     ]);
// }

// export function camera_control_2d(){
//     const { camera, gl } = useThree();
//     useEffect(() => {
//         const mesh_line = new MeshLine();

//         return () => {
// 			mesh_line.dispose();
// 		};
//       },
//       [camera, gl]
//     );
//     return r('mesh', {
//         p: p,
//         ref: mesh, 
//         //onPointerMove: (event) => set_vect(event.intersections[0].point),},[ 
//         },[
//             r('planeGeometry', {args:[10000, 10000]}),
//             r('meshBasicMaterial', {color: 'white', toneMapped:false}),
//     ]);
// }