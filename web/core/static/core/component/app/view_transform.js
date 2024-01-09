import {createElement as c, useRef, forwardRef, useState} from 'react';
import {use_store} from 'delimit';
import {useFrame,} from '@react-three/fiber';
import {Vector3} from 'three';
import { useSpring, animated, config, to } from '@react-spring/three';

const v1 = new Vector3();
const v2 = new Vector3();

export const View_Transform = forwardRef((props, ref)=>{ 
    var obj = null;
    const point_size = use_store(d=> d.point_size);
    //const {camera} = useThree();
    const {position} = useSpring({ position:[props.position.x, props.position.y, 0] });
    //let x = to(spring, value=> value);//spring_x.to(value=> value+1);
    //let y = to(spring_y, value=> value);//spring_x.to(value=> value+1);
    useFrame((state) => { // use d.cam_info here? #1
        if(props.size){
            let factor = props.size / state.camera.zoom; // must account for camera distance if perspective ?!?!?!?!
            obj.scale.set(factor,factor,factor);
        }
        if(props.offset_z){
            state.camera.getWorldDirection(v1);
            obj.getWorldDirection(v2);
            if(v1.dot(v2)>0) obj.position.set(0, 0,  point_size*props.offset_z / state.camera.zoom);//props.offset_z / state.camera.zoom);
            else             obj.position.set(0, 0, -point_size*props.offset_z / state.camera.zoom);//-props.offset_z / state.camera.zoom);
        }
    });
    return (c(animated.group, {...props, position, ref:r=>{
        obj = r; 
        if(ref) ref.current = r; 
    }}))
});

export const Spinner = forwardRef((props, ref)=>{
    var obj = null;
    const [dir, set_dir] = useState(new Vector3().random());//random_vector({min:0.5, max:0.5}));
    useFrame((state, delta) => {
        obj.rotateX(delta * dir.x);
        obj.rotateY(delta * dir.y);
        obj.rotateZ(delta * dir.z);
    });
    return (c('group', {...props, ref:r=>{
        obj = r; 
        if(ref) ref.current = r; 
    }}))
});

// export function Root_Transform({n, rotation, children}){
//     const obj = useRef();
//     useSubS(d=> [d.n[n].c.matrix, d.n[n].ax.matrix], ([c_mat, ax_mat])=>{ 
//         obj.current.position.set( 0, 0, 0 );
//         if(rotation) obj.current.rotation.set(...rotation)
//         else obj.current.rotation.set( 0, 0, 0 );
//         obj.current.scale.set( 1, 1, 1 );
//         if(c_mat) obj.current.applyMatrix4(c_mat);
//         if(ax_mat) obj.current.applyMatrix4(ax_mat);
//     });
//     return(
//         c('group', {
//             ref: obj,
//             children:children,
//         })
//     )
// }

// // export function Root_Transform({n, rotation, children}){
// //     const obj = useRef();
// //     useSub(d=> d.n[n].p, p=>{ 
// //         obj.current.position.set(0, 0, 0);
// //         if(rotation) obj.current.rotation.set(...rotation)
// //         else obj.current.rotation.set(0, 0, 0);
// //         obj.current.scale.set(1, 1, 1);
// //         if(p?.matrix) obj.current.applyMatrix4(p.matrix);
// //     });
// //     return(
// //         c('group', {
// //             ref: obj,
// //             children:children,
// //         })
// //     )
// // }



// export function Badge({n}){ // more than one reason to change but okay because it's so simple?
//     const name = useS(d=> d.n[n].c.name);
//     const color = useS(d=> d.n[n].pick.color);
//     const d = gs();
//     const t = d.n[n].t;
//     //console.log('render node badge');
//     return (
//         c(Boot_Badge, {bg:color[4]}, 
//             c(Svg, {svg:d.spec.icon(d,n), color:'white'}),
//             (name?' '+name:'') + ' ('+d.spec.tag(d,n)+')'
//         ) //c(Boot_Badge, {className:d.nodes[t].css, bg:color[4]}, (name?' '+name:'') + ' ('+d.nodes[t].tag+')')
//     )
// }



// if(d.studio.mode=='design' && d.design.mode == 'erase'){
//     d.delete.node(d, n, {deep:true});
// }else{
    
//         const a = {deep:d.pick.deep};
//         if(d.pick.multi){d.pick.set(d, n, !d.n[n].pick.pick, a)} // || e.multi
//         else            {d.pick.one(d, n, a)}  
    
// }


// onPointerOver:e=>{
//     e.stopPropagation(); 
//     ss(d=>{
//         if(!d.studio.gizmo_active){
//             d.pick.hover(d, n, true);
//         }
//     });
// }, // should be something different from recieve state but should not enact state here

// onPointerUp(e){
        //     if(e.which==3){//[0,1].includes(e.which)){
        //         ss(d=>{ d.studio.gizmo_active = false; });
        //     }
        // },
        // onPointerMove(e){
        //     e.stopPropagation(); 
        //     ss(d=>{
        //         if(!d.studio.gizmo_active){
        //             d.pick.hover(d, n, true);
        //         }
        //     });
        // },

// export function Cat_Badge({t}){ // need to include remove button ?!?!?!?!
//     const d = gs();
//     return (
//         c(Boot_Badge, {className:'bg-secondary '+d.nodes.meta[t].css, style:{fontSize:'16px'}}, 
//             ' '+d.nodes.meta[t].tag,
//             c(CloseButton, {className:'p-0 m-0'}),
//         )
//     )
// }

// export function Cat_Badge({t}){ // need to include remove button ?!?!?!?!
//     const d = gs();
//     return (
//         c(Boot_Badge, {className:'bg-secondary '+d.nodes.meta[t].css, style:{fontSize:'16px'}}, 
//             ' '+d.nodes.meta[t].tag,
//             c(CloseButton, {className:'p-0 m-0'}),
//         )
//     )
// }