import {createElement as rce, useEffect, useRef, useState } from 'react';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import * as vtx from 'easel/vertex.js';

extend({ MeshLine, MeshLineMaterial })

const history = [];
var history_index = 0;
const constraints = [];

export function Line(args) {
    const mesh = useRef();
    const { camera } = useThree();
    const [selected, set_selected] = useState(false);
    const [verts, set_verts] = useState();
    const material = useRef();

    //useEffect(()=>{
        
    //});

    useFrame(()=> (material.current.lineWidth = 4 / camera.zoom)); // make this run only on zoom change

    useEffect(()=>{
        set_verts(args.verts);
    },[args.verts]);

    useEffect(()=>{
        if(args.selection == mesh.current){
            set_selected(true);
        }else{
            set_selected(false); 
        }
    },[args.selection]);

    //useEffect(()=>{ 
	// 	set_mods([args.verts]);
	//},[args.verts]);

    useEffect(()=>{ 
       if(selected){
            //console.log('mod_verts changed');
            const closest = vtx.closest_to_endpoints(verts, args.mod_verts);
            const new_verts = vtx.map(args.mod_verts, closest.v1, closest.v2);
            const new_verts_2 = vtx.replace(verts, closest.i1, closest.i2, new_verts);
            update({verts: new_verts_2, rules: true, constrain:true, record:true});
       }
	},[args.mod_verts]);

     
    function update(args2){
        //console.log('update line');
        if(args2.rules){
            set_verts(vtx.set_density(args2.verts,1,2));
        }
        if(args2.constrain > 0){
            constraints.forEach(constraint =>{
                constraint.enforce(args2.constrain);
            });
        }
        if(args2.record){
            record();
            //parent.product.record();
        }
    }

    function record(){
        history.splice(history_index);
        history.push(verts);
        if(history.length > 7){
            history.shift();
        }
        history_index = history.length;
    }

    useEffect(()=>{
        //console.log('history_action changed: '+ args.history_action);
        if(args.history_action == 'record'){
            record();
        }else if(args.history_action == 'revert'){
            console.log('revert!');
            set_verts(history[history_index-1]);
        }else if(args.history_action == 'undo'){
            if(history_index-1 > 0){
                history_index--;
                set_verts(history[history_index-1]);
            }
        }else if(args.history_action == 'redo'){
            if(history_index+1 <= history.length){
                history_index++;
                set_verts(history[history_index-1]);
            }
        };
    },[args.history_action]);


    //console.log('Line top level verts before render: ');
   // console.log(verts);
    //console.log(args);
    return (
        rce('mesh', {
            ref: mesh,
            raycast: (args.selection=='off') ? undefined : MeshLineRaycast,
        },[
            rce('meshLine', {attach:'geometry', points: verts}),
            rce('meshLineMaterial', {ref:material, color:selected?'lightblue':'grey',}),
        ])
    )
}

//color:new Color('hsl(0,0%,55%)'),})

// function Line(props) {
//     //const mesh = useRef();
//     //const [vect, set_vect] = useState(new Vector3());
//     //useFrame(() => (console.log(vect)));
//     return rce('mesh', {
//         props: props,
//         ref: mesh, 
//         //onPointerMove: (event) => set_vect(event.intersections[0].point),},[ 
//         geometry: new MeshLine(),
//     },[
//             rce('planeGeometry', {args:[10000, 10000]}),
//             rce('meshBasicMaterial', {color: 'white', toneMapped:false}),
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
//     return rce('mesh', {
//         props: props,
//         ref: mesh, 
//         //onPointerMove: (event) => set_vect(event.intersections[0].point),},[ 
//         },[
//             rce('planeGeometry', {args:[10000, 10000]}),
//             rce('meshBasicMaterial', {color: 'white', toneMapped:false}),
//     ]);
// }