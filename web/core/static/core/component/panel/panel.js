import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Container, CloseButton} from 'react-bootstrap';
import {ss, gs, useS, use_window_size} from '../../app.js';
import { Inspect } from './inspect.js';
import { Make } from './make.js';
import { Visual } from './visual.js';

export function Panel(){ 
    const show = useS(d=> d.studio.panel.show);
    const window_size = use_window_size();
    const [width, set_width] = useState('100vw');
    useEffect(()=>{
        if(window_size.width <=576) set_width('100vw');
        if(window_size.width > 576) set_width('30vw');
    },[window_size.width])
    return (
        show && c(Container, {className:'position-absolute start-0 ps-3 pe-3', style:{minWidth:'350px', maxWidth:width}}, 
            c(Container, {fluid:true, className:'bg-white pt-3 ps-3 pe-3 border rounded'}, 
                c(CloseButton, {
                    className:'position-absolute top-0 end-0 mt-2 me-4',
                    onClick:()=>{ss(d=>d.studio.panel.show=false)}
                }),
                c(Make),
                c(Inspect),
                c(Visual),
            )
        )
    )
}

//c(Container, {fluid:true, className:'position-absolute start-0 bg-white mt-2 p-3 border rounded', style:{maxWidth:width}}, 

//const panel = useS(d=> d.studio.panel.name);

//const part = useS(d=> d.design.part);
    //const nodes = useS(d=> d.pick.n); 

// useEffect(()=>{
    //     if(nodes.length){
    //         if(window_size.width>=576 || (show && (panel=='inspect_design' || panel=='inspect_nodes'))){
    //             if(part && nodes.length==1 && nodes[0]==part){
    //                 ss(d=> d.studio.panel={name:'inspect_design', show:true});
    //             }else{
    //                 ss(d=> d.studio.panel={name:'inspect_nodes', show:true});
    //             }
    //         }
    //     }else{
    //         if((panel=='inspect_design' || panel=='inspect_nodes')) ss(d=> d.studio.panel.show=false);
    //     }
    // },[nodes]);