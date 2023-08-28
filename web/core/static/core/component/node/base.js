import {createElement as c, useRef, forwardRef, useState} from 'react';
import {Badge as Boot_Badge, CloseButton} from 'react-bootstrap';
import {useS, useSubS, ss, gs, fs, sf, mf, rs} from '../../app.js';
//import {createElement as c, StrictMode, useEffect, useState, useRef, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';

const v1 = new Vector3();
const v2 = new Vector3();

export function Pickable({n, penable, brushable, children}){
    function pointer_up_or_leave(e){ e.stopPropagation(); 
        if(brushable && ['painting','erasing'].includes(gs().design.act)){//gs().design.painting && gs().design.mode == 'brush'){
            mf(d=>{
                d.design.end_paint(d, n);
            });
        }
    }
    return c('group', {
        name: 'pickable',
        pickable: n, // for accessing via three_object.__r3f.memoizedProps.pickable
        onClick(e){ e.stopPropagation();//e.stopPropagation?.call(); 
            ss(d=>{
                if(!d.studio.gizmo_active && e.delta < d.max_click_delta){
                    if(penable && d.design.mode == 'pen'){
                        d.design.make_point(d, n, e);
                    }else if(brushable && d.design.mode == 'fill'){
                        d.design.fill(d, n);
                    }else if(d.studio.mode=='design' && d.design.mode == 'erase'){
                        d.delete.node(d, n, {deep:true});
                    }else if(!(brushable && d.design.mode == 'brush')){
                        const a = {deep:d.pick.deep};
                        if(d.pick.multi) d.pick.set(d, n, !d.n[n].pick.pick, a) // || e.multi
                        else             d.pick.one(d, n, a);
                    }
                }
                d.studio.gizmo_active = false;
            });
        },
        onPointerOver(e){ e.stopPropagation();  rs(d=>{
            d.pick.hover(d, n, true);
            if(penable && d.design.mode == 'pen') d.studio.cursor = 'pen_icon';
            if(brushable && d.design.mode == 'brush') d.studio.cursor = 'brush_icon';
            if(brushable && d.design.mode == 'erase') d.studio.cursor = 'eraser_icon';
        });}, // should be something different from recieve state but should not commit state here
        onPointerOut(e){ e.stopPropagation(); rs(d=>{
            d.pick.hover(d,n, false);
            if(penable || brushable) d.studio.cursor = '';
        });},
        onPointerDown(e){ e.stopPropagation(); 
            if([0,1].includes(e.which) && brushable && ['brush','erase'].includes(gs().design.mode)){
                fs(d=>{
                    if(d.design.mode == 'brush') d.design.act = 'painting';  //d.design.paint(d, n, e);
                    if(d.design.mode == 'erase') d.design.act = 'erasing'; //d.design.erase(d, n, e);
                    d.design.paint(d, n, e);
                });
            }
        },
        onPointerMove(e){ e.stopPropagation(); 
            if(brushable && ['painting','erasing'].includes(gs().design.act)){
                sf(d=>{
                    d.design.paint(d, n, e);
                    //if(d.design.act == 'painting') d.design.paint(d, n, e);
                    //if(d.design.act == 'erasing')  d.design.erase(d, n, e);
                });
            }
        },
        onPointerUp(e){ 
            pointer_up_or_leave(e);
        },
        onPointerLeave(e){ 
            pointer_up_or_leave(e);
        },
        children:children,
    });
}

export function Root_Transform({n, rotation, children}){
    const obj = useRef();
    useSubS(d=> [d.n[n].c.matrix, d.n[n].ax.matrix], ([c_mat, ax_mat])=>{ 
        obj.current.position.set( 0, 0, 0 );
        if(rotation) obj.current.rotation.set(...rotation)
        else obj.current.rotation.set( 0, 0, 0 );
        obj.current.scale.set( 1, 1, 1 );
        if(c_mat) obj.current.applyMatrix4(c_mat);
        if(ax_mat) obj.current.applyMatrix4(ax_mat);
    });
    return(
        c('group', {
            ref: obj,
            children:children,
        })
    )
}

export const View_Transform = forwardRef((props, ref)=>{ 
    var obj = null;
    const point_size = useS(d=> d.point_size);
    //const {camera} = useThree();
    useFrame((state) => { // use d.cam_info here? #1
        if(props.size){
            var factor = props.size / state.camera.zoom; // must account for camera distance if perspective ?!?!?!?!
            obj.scale.set(factor,factor,factor);
        }
        if(props.offset_z){
            state.camera.getWorldDirection(v1);
            obj.getWorldDirection(v2);
            if(v1.dot(v2)>0) obj.position.set(0, 0,  point_size*props.offset_z / state.camera.zoom);//props.offset_z / state.camera.zoom);
            else             obj.position.set(0, 0, -point_size*props.offset_z / state.camera.zoom);//-props.offset_z / state.camera.zoom);
        }
    });
    return (c('group', {...props, ref:r=>{
        obj = r; 
        if(ref) ref.current = r; 
    }}))
});

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const name = useS(d=> d.n[n].c.name);
    const color = useS(d=> d.n[n].pick.color);
    const d = gs();
    const t = d.n[n].t;
    //console.log('render node badge');
    return (
        c(Boot_Badge, {className:d.node.meta[t].css, bg:color[4]}, (name?' '+name:'') + ' ('+d.node.meta[t].tag+')')
    )
}

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
// }, // should be something different from recieve state but should not commit state here

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
//         c(Boot_Badge, {className:'bg-secondary '+d.node.meta[t].css, style:{fontSize:'16px'}}, 
//             ' '+d.node.meta[t].tag,
//             c(CloseButton, {className:'p-0 m-0'}),
//         )
//     )
// }

// export function Cat_Badge({t}){ // need to include remove button ?!?!?!?!
//     const d = gs();
//     return (
//         c(Boot_Badge, {className:'bg-secondary '+d.node.meta[t].css, style:{fontSize:'16px'}}, 
//             ' '+d.node.meta[t].tag,
//             c(CloseButton, {className:'p-0 m-0'}),
//         )
//     )
// }