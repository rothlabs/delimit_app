import {createElement as c, useRef, forwardRef, useState} from 'react';
import {Badge as Boot_Badge, CloseButton} from 'react-bootstrap';
//import {useS, useSub, useSubS, ss, gs, fs, sf, mf, rs, readable} from '../../app.js';
import {Svg} from '../app/app.js';
//import {createElement as c, StrictMode, useEffect, useState, useRef, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {set_store} from 'delimit';

const v1 = new Vector3();
const v2 = new Vector3();

export function Pickable({node, penable, brushable, children}){
    // function pointer_up_or_leave(e){ e.stopPropagation(); 
    //     if(brushable && ['painting','erasing'].includes(gs().design.act)){//gs().design.painting && gs().design.mode == 'brush'){
    //         mf(d=>{
    //             d.design.end_paint(d, n);
    //         });
    //     }
    // }
    return c('group', {
        name: 'pickable',
        pickable: node, // for accessing via three_object.__r3f.memoizedProps.pickable
        onClick(e){ //e.stopPropagation();//e.stopPropagation?.call(); 
            e.stopPropagation();
            set_store(d=>{
                d.pick.node(d, node, {multi:e.ctrlKey});
            });
            // ss(d=>{
            //     if(!d.studio.gizmo_active && e.delta < d.max_click_delta){
            //         if(penable && d.design.mode == 'pen'){
            //             d.design.make_point(d, n, e);
            //         }else if(brushable && d.design.mode == 'fill'){
            //             d.design.fill(d, n);
            //         }else if(d.studio.mode=='design' && d.design.mode == 'erase'){
            //             d.delete.node(d, n, {deep:true});
            //         }else if(!(brushable && d.design.mode == 'brush')){
            //             const a = {deep:d.pick.deep};
            //             if(d.pick.multi) d.pick.set(d, n, !d.n[n].pick.pick, a) // || e.multi
            //             else             d.pick.one(d, n, a);
            //         }
            //     }
            //     d.studio.gizmo_active = false;
            // });
        },
        onPointerOver:(e)=>{
            document.body.style.cursor = 'pointer';
        },
        onPointerOut(e){ 
            document.body.style.cursor = 'auto';
        },
        // onPointerOver(e){ e.stopPropagation();  rs(d=>{
        //     d.pick.hover(d, n, true);
        //     if(penable && d.design.mode == 'pen') d.studio.cursor = 'pen_icon';
        //     if(brushable && d.design.mode == 'brush') d.studio.cursor = 'brush_icon';
        //     if(brushable && d.design.mode == 'erase') d.studio.cursor = 'eraser_icon';
        // });}, // should be something different from recieve state but should not commit state here
        // onPointerOut(e){ e.stopPropagation(); rs(d=>{
        //     d.pick.hover(d,n, false);
        //     if(penable || brushable) d.studio.cursor = '';
        // });},
        // onPointerDown(e){ e.stopPropagation(); 
        //     if([0,1].includes(e.which) && brushable && ['brush','erase'].includes(gs().design.mode)){
        //         fs(d=>{
        //             if(d.design.mode == 'brush') d.design.act = 'painting';  //d.design.paint(d, n, e);
        //             if(d.design.mode == 'erase') d.design.act = 'erasing'; //d.design.erase(d, n, e);
        //             d.studio.gizmo_active = true; // this might not be needed? #1
        //             d.design.paint(d, n, e);
        //         });
        //     }
        // },
        // onPointerMove(e){ e.stopPropagation(); 
        //     if(brushable && ['painting','erasing'].includes(gs().design.act)){
        //         sf(d=>{
        //             d.design.paint(d, n, e);
        //             //if(d.design.act == 'painting') d.design.paint(d, n, e);
        //             //if(d.design.act == 'erasing')  d.design.erase(d, n, e);
        //         });
        //     }
        // },
        // onPointerUp(e){ 
        //     pointer_up_or_leave(e);
        // },
        // onPointerLeave(e){ 
        //     pointer_up_or_leave(e);
        // },
        children:children,
    });
}
