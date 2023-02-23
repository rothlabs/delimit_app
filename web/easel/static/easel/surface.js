import {createElement as r, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {useFrame} from 'r3f';
//import {TextureLoader} from 'three';

export const Surface = forwardRef(function Surface(p, ref) {
    const mesh = useRef();
    const material = useRef();
    //const [selected, set_selected] = useState(false);
    const [history, set_history] = useState({
        textures:[],
        index:0,
    });

    function prev_texture(){
        return history.textures[history.index-1];
    }

    function texture(){
        return material.current.map; 
    }

    function update(args){
        if(args.record) p.base.set_act({name:'record'});
    }

    useImperativeHandle(ref,()=>{return{ 
        update:(args)=> update(args),
        set_texture(){

        },
    };});

    useFrame(()=> {

    }); 

    // useEffect(()=>{
    //     set_selected(false); 
    //     if(p.selection){
    //         if(p.selection.object == mesh.current)  set_selected(true);
    //     }
    // },[p.selection]);

    useEffect(()=>{
        if(p.base.act && p.selection!='off'){
            if(p.base.act.name == 'record'){
                history.textures.splice(history.index);
                history.textures.push(texture());
                if(history.textures.length > 7){
                    history.textures.shift();
                }
                history.index = history.textures.length;
            //}else if(p.base.act.name == 'revert'){
            //    set_verts(history.verts[history.index-1]);
            }else if(p.base.act.name == 'undo'){
                if(history.index-1 > 0){
                    history.index--;
                    //update({verts:history.verts[history.index-1], raw:true});
                }
            }else if(p.base.act.name == 'redo'){
                if(history.index+1 <= history.textures.length){
                    history.index++;
                    //update({verts:history.verts[history.index-1], raw:true});
                }
            }
            set_history(history);
        }
    },[p.base.act]);

    return (r('mesh',{ref:mesh, geometry:p.node.geometry, position:p.node.position}, 
        r('meshBasicMaterial',{ref:material, map:p.node.material.map, transparent:true, toneMapped:false})//, , depthWrite:false 
    ))
});

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