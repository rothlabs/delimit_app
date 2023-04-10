import {createElement as r, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {use_child} from '../app.js';
//import {useFrame} from 'r3f';
import {editor_act_rv} from './editor.js';
import {useReactiveVar} from 'apollo';
//import {TextureLoader} from 'three';

export const Surface = forwardRef(function Surface(p, ref) {
    const source_verts = use_child(p.source,'mesh', c=> c.geometry.attributes.position.array);
    const attr_pos = useRef();
    return (
        r('group', {name:p.source.name},
            r('mesh',{
                name:'mesh',
            }, 
                r('bufferGeometry',{},
                    r('sphere',{attach:'boundingSphere', radius:10000}),
                    r('bufferAttribute',{ref:attr_pos, attach:'attributes-position', count:source_verts.length, itemSize:3, array:source_verts}), 
                    //r('bufferAttribute',{ref:point_attr_color, attach:'attributes-color', count:max_points, itemSize:3, array:point_colors()}),//r('bufferAttribute',{ref:point_attr_color, attach:'attributes-color', count:source_verts.length, itemSize:3, array:point_colors(source_verts.length)}),
                ),
            )
        )
    )
});

// r('boxGeometry',{
//     args: [50, 50, 50],
// }),


//r('meshBasicMaterial',{ref:material, map:p.node.material.map, transparent:true, toneMapped:false}),

//, , depthWrite:false 

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