import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Container, CloseButton, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS, use_window_size, static_url} from '../../app.js';
import { Inspect } from './inspect.js';
import { Make } from './make.js';
import { Visual } from './visual.js';
import {Badge} from '../node/base.js'
// import {Visible} from '../toolbar/visible.js';
// import {Remake} from '../toolbar/remake.js';
// import {Apply} from '../toolbar/apply.js';
// import {Delete} from '../toolbar/delete.js';
// import {Close} from '../toolbar/close.js';

export function Panel(){ 
    const show = useS(d=> d.studio.panel.show);
    const panel = useS(d=> d.studio.panel.name);
    const nodes = useS(d=> d.pick.n);
    const limited = useS(d=> d.pick.limited); 
    const window_size = use_window_size();
    const [width, set_width] = useState('100vw');
    const [height, set_height] = useState('70vh');
    useEffect(()=>{
        if(window_size.width <=576) set_width('100vw');
        if(window_size.width > 576) set_width('30vw');
    },[window_size.width])
    const d = gs();
    return (
        show && c(Container, {
            className:'position-absolute start-0', // ps-3 pe-3 
            style:{
                minWidth:'350px', 
                maxWidth: width, 
            },
        }, 
            c(Container, {
                fluid:true, 
                className:'bg-white pt-3 ps-3 pb-3 border rounded',
                // style:{
                //     maxHeight: height,
                //     overflow: 'auto',
                // },
            }, 
                c(Container, {
                    fluid:true, 
                    className:'p-0 m-0',
                    style:{
                        minHeight: '36px',
                    },
                }, 
                    c(CloseButton, {
                        className:'position-absolute top-0 end-0 mt-3 me-4',
                        onClick:()=>{ss(d=>d.studio.panel.show=false)}
                    }),
                    (['make', 'inspect_design', 'inspect_nodes'].includes(panel)) &&
                        c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
                            limited ? c(Col,{className:'ps-0 pe-0'}, c(Badge, {n:d.user})) :
                            nodes.map(n=>
                                c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
                                    c(Badge, {n:n})
                                ) 
                            ),
                        ),
                ),
                c(Container, {
                    fluid:true, 
                    className:'p-0 m-0 pe-3',// ps-3 pe-3',
                    style:{
                        maxHeight: height,
                        overflow: 'auto',
                        //scrollbarColor: 'red orange',
                    },
                }, 
                    c(Make),
                    c(Inspect),
                    c(Visual),
                ),
            )
        )
    )
}

// (['inspect_design', 'inspect_nodes'].includes(panel) && !limited) && 
                    //     c(ButtonToolbar, {className:'gap-2 mb-3'},
                    //         c(Visible),
                    //         c(Remake),
                    //         c(Apply),
                    //         c(Delete),
                    //         c(Close),
                    //     ),

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