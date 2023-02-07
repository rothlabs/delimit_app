import {createElement as rce, useEffect, useRef, useState } from 'react';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import * as vtx from 'easel/vertex.js';

extend({ MeshLine, MeshLineMaterial })

export function Line(props) {
    const mesh = useRef();
    const material = useRef();
    const { camera } = useThree();
    const [selected, set_selected] = useState(false);
    const [verts, set_verts] = useState();
    const [data, set_data] = useState({
        history:[],
        history_index:0,
        constraints:[],
    });

    useFrame(()=> (material.current.lineWidth = 4 / camera.zoom)); // make this run only on zoom change

    useEffect(()=>{
        set_verts(props.verts);
    },[props.verts]);

    useEffect(()=>{
        if(props.selection == mesh.current){
            set_selected(true);
        }else{
            set_selected(false); 
        }
    },[props.selection]);

    useEffect(()=>{ 
       if(selected){
            const closest = vtx.closest_to_endpoints(verts, props.mod_verts);
            const new_verts = vtx.map(props.mod_verts, closest.v1, closest.v2);
            const new_verts_2 = vtx.replace(verts, closest.i1, closest.i2, new_verts);
            update({verts: new_verts_2, rules: true, constrain:true, record:true});
       }
	},[props.mod_verts]);

     
    function update(args){
        if(args.rules){
            set_verts(vtx.set_density(args.verts,1,2));
        }
        if(args.constrain > 0){
            data.constraints.forEach(constraint =>{
                constraint.enforce(args.constrain);
            });
        }
        if(args.record){
            props.base.set_action({name:'record'});
        }
    }

    useEffect(()=>{
        if(props.base.action && props.selection!='off'){
            if(props.base.action.name == 'record'){
                data.history.splice(data.history_index);
                data.history.push(verts);
                if(data.history.length > 7){
                    data.history.shift();
                }
                data.history_index = data.history.length;
            }else if(props.base.action.name == 'revert'){
                console.log('revert!');
                set_verts(data.history[data.history_index-1]);
            }else if(props.base.action.name == 'undo'){
                if(data.history_index-1 > 0){
                    data.history_index--;
                    set_verts(data.history[data.history_index-1]);
                    //console.log(data.history_index);
                }
            }else if(props.base.action.name == 'redo'){
                if(data.history_index+1 <= data.history.length){
                    data.history_index++;
                    set_verts(data.history[data.history_index-1]);
                }
            };
            set_data(data);
        }
    },[props.base.action]);

    return (
        rce('mesh', {
            ref: mesh,
            raycast: (props.selection!='off') ? MeshLineRaycast : undefined,
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