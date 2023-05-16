import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Container, CloseButton} from 'react-bootstrap';
import {ss, ssp, gs, useS, use_window_size} from '../../app.js';
import { Inspect } from './inspect.js';
import { Make } from './make.js';

export function Panel(){ 
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const part = useS(d=> d.design.part);
    const nodes = useS(d=> d.pick.nodes); 
    const window_size = use_window_size();
    const [width, set_width] = useState('100vw');
    useEffect(()=>{
        if(nodes.length){
            if(window_size.width>=576 || (show && (panel=='inspect_design' || panel=='inspect_nodes'))){
                if(part && nodes.length==1 && nodes[0]==part){
                    ss(d=> d.studio.panel={name:'inspect_design', show:true});
                }else{
                    ss(d=> d.studio.panel={name:'inspect_nodes', show:true});
                }
            }
        }else{
            ss(d=> d.studio.panel.show=false);
        }
    },[nodes]);
    useEffect(()=>{
        if(window_size.width<=576) set_width('100vw');
        if(window_size.width>576) set_width('30vw');
    },[window_size.width])
    return (
        show && c(Container, {fluid:true, className:'position-absolute start-0 bg-white mt-2 p-3 border rounded', style:{maxWidth:width}}, 
            c(CloseButton, {
                className:'position-absolute top-0 end-0 m-2',
                onClick:()=>{ss(d=>d.studio.panel.show=false)}
            }),
            c(Make),
            c(Inspect),
        )
    )
}