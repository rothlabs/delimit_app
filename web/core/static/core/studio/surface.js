import {createElement as r, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {id_of, child, use_effect} from '../app.js';
//import {useFrame} from 'r3f';
import {editor_rv, action_rv, sketches_rv} from './editor.js';
import {useReactiveVar} from 'apollo';
//import {TextureLoader} from 'three';

export const Surface = forwardRef(function Surface({source}, ref) {
    //const source_verts = child(source,'mesh', c=> c.geometry.attributes.position.array);
    //const source_verts = new Float32Array([0,0,0, 25,0,0, 25,25,0]);
    //const sketch_name = child(source,'arg__sketch', c=> c.geometry.attributes.position.array);
    //const sketch = product_rv.sketch(child(source,'arg__sketch', c=> c.name.split('__')[2])); //use_child(product_rv,'sketch__0', c=> c.geometry.attributes.position.array);
    const surface = useRef();
    const geom = useRef();
    const sketches = useReactiveVar(sketches_rv);
    const editor = useReactiveVar(editor_rv);
    //const meta = use_meta(source); // this will automatically grab meta data for this object collected by editor query 

    use_effect([sketches, editor], ()=>{ 
        const surf = editor.surfaces.find(s=> s.id == id_of(source)); //source.name.split('__')[1]
        const sketch = sketches.get(surf.sketch.id);
        console.log(sketch);
    });

    return (
        r('group', {ref:surface, name:source.name}, 
             r('mesh',{
                 name:'mesh',
             }, 
                r('planeGeometry',{
                    ref: geom,
                    args: [50, 50, 10, 10],
                }),
             )
        )
    )
});

            //     r('bufferGeometry',{},
            //         r('sphere',{attach:'boundingSphere', radius:10000}),
            //         r('bufferAttribute',{ref:attr_pos, attach:'attributes-position', count:source_verts.length, itemSize:3, array:source_verts}), 
            //         //r('bufferAttribute',{ref:point_attr_color, attach:'attributes-color', count:max_points, itemSize:3, array:point_colors()}),//r('bufferAttribute',{ref:point_attr_color, attach:'attributes-color', count:source_verts.length, itemSize:3, array:point_colors(source_verts.length)}),
            //     ),


//let planeGeom = new THREE.PlaneGeometry(1, 1, divisions, frames.length + tailfinSlices -1);
//planeGeom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
//planeGeom.computeVertexNormals();


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