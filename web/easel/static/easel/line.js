import {createElement as rce, useEffect, useRef, useState } from 'react';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import {Color} from 'three';
import {Vector3} from 'three';
import {Product} from 'easel/product.js';

extend({ MeshLine, MeshLineMaterial })

export function Line({verts, selection}) {
    const mesh = useRef();
    const { camera } = useThree();
    const [selected, set_selected] = useState(false);
    useEffect(()=>{
        if(selection == mesh.current){
            set_selected(true);
        }else{
            set_selected(false); 
        }
    },[selection]);
    const material = useRef();
    useFrame(()=> (material.current.lineWidth = 4 / camera.zoom)); // make this run only on zoom change
    return (
        rce('mesh', {
            ref: mesh,
            raycast:MeshLineRaycast,
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