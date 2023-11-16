import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Container, CloseButton, Row, Col, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS, use_window_size, static_url} from '../../app.js';
import {Make_Node}    from './make_node.js';
import {Make_Repo} from './make_repo.js';
import {Inspect} from './inspect.js';
import {Modules} from './modules.js';
import {Display} from './display.js';
import {Badge} from '../node/base.js'
// import {Visible} from '../toolbar/visible.js';
// import {Remake} from '../toolbar/remake.js';
// import {Apply} from '../toolbar/apply.js';
// import {Delete} from '../toolbar/delete.js';
// import {Close} from '../toolbar/close.js';

export function Panel(){ 
    const studio_mode = useS(d=> d.studio.mode);
    //const show = useS(d=> d.studio.panel.show);
    const mode = useS(d=> d.studio.panel.mode);
    //if(!show) return false;
    if(mode == 'make'){
        if(studio_mode == 'repo') return c(Make_Repo);
        return c(Make_Node);
    }
    if(mode == 'inspect') return c(Inspect);
    if(mode == 'modules') return c(Modules);
    if(mode == 'display') return c(Display);
    return false;
}

// export function Panel(){ 
//     const show = useS(d=> d.studio.panel.show);
//     const mode = useS(d=> d.studio.panel.mode);
//     const nodes = useS(d=> d.pick.n);
//     const limited = useS(d=> d.pick.limited); 
//     const window_size = use_window_size();
//     const [width, set_width] = useState('100vw');
//     const [height, set_height] = useState('70vh');
//     useEffect(()=>{
//         if(window_size.width <=576) set_width('100vw');
//         if(window_size.width > 576) set_width('30vw');
//     },[window_size.width])
//     if(!show) return;
//     return (
//         c(Container, {
//             className:'position-absolute start-0', // ps-3 pe-3 
//             style:{
//                 minWidth:'350px', 
//                 maxWidth: width, 
//             },
//         }, 
//             c(Container, {
//                 fluid:true, 
//                 className:'bg-white border rounded', // pt-3 ps-3 pb-3
//                 // style:{
//                 //     maxHeight: height,
//                 //     overflow: 'auto',
//                 // },
//             }, 
//                 c(Row, {
//                     //fluid:true, 
//                     //className:'p-0 m-0',
//                     // style:{
//                     //     minHeight: '36px',
//                     // },
//                 }, 
//                     c(Col, {},//{className:'p-0 m-0'},
//                         (['make', 'inspect_design', 'inspect_nodes'].includes(panel)) &&
//                             c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
//                                 //limited ? c(Col,{className:'ps-0 pe-0'}, c(Badge, {n:d.user})) :
//                                 nodes.map(n=>
//                                     c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
//                                         c(Badge, {n:n})
//                                     ) 
//                                 ),
//                             ),
//                     ),
//                     c(Col, {className:'d-flex justify-content-end', xs:'2'}, //, xxl:'2'  md:'auto',
//                         c(CloseButton, {className:'mt-2',
//                             //className:'position-absolute top-0 end-0 mt-3 me-4',
//                             onClick:()=>{ss(d=>d.studio.panel.show=false)}
//                         }),
//                     ),
//                 ),
//                 c(Row, {
//                     //fluid:true, 
//                     //className:'p-0 m-0 pt-1 pe-3',// ps-3 pe-3',
//                     style:{
//                         maxHeight: height,
//                         overflow: 'auto',
//                         //scrollbarColor: 'red orange',
//                     },
//                 }, 
//                     c(Make),
//                     c(Inspect),
//                     c(Visual),
//                 ),
//             )
//         )
//     )
// }

// (['inspect_design', 'inspect_nodes'].includes(panel) && !limited) && 
                    //     c(ButtonToolbar, {className:'gap-2 mb-3'},
                    //         c(Visible),
                    //         c(Remake),
                    //         c(Apply),
                    //         c(Delete),
                    //         c(Close),
                    //     ),

//c(Container, {fluid:true, className:'position-absolute start-0 bg-white mt-2 p-3 border rounded', style:{maxWidth:width}}, 

//const panel = useS(d=> d.studio.panel.mode);

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