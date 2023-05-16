import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Dropdown, Container, Form, ButtonGroup, Button, ToggleButton} from 'react-bootstrap';
//import {Dropdown} from 'react-bootstrap/Dropdown';
import {ss, ssp, gs, useS, use_window_size} from '../../app.js';
import {Badge} from '../../node/basic.js'
import {String} from '../../node/input/string.js';
import {Float} from '../../node/input/float.js';

export function Inspect(){ 
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const part = useS(d=> d.design.part);
    const d = gs();
    console.log('render inspector');
    return (
        c(ButtonGroup, {}, 
            c(ToggleButton,{
                id: 'inspect_design',
                type: 'checkbox',
                variant: 'outline-primary', size: 'lg',
                checked: show && panel=='inspect_design',
                value: '1',
                onChange:(e)=> { 
                    console.log(e.currentTarget.checked);
                    if(e.currentTarget.checked){
                        ss(d=> {d.studio.panel={name:'inspect_design', show:true}; d.pick.one(d, part);});
                    }else{ ss(d=> d.studio.panel.show=false); }
                }, 
                className: 'bi-box me-1',
            }),
            c(ToggleButton,{
                id: 'inspect_nodes',
                type: 'checkbox',
                variant: 'outline-primary', size: 'lg',
                checked: show && panel=='inspect_nodes',
                value: '2',
                onChange:(e)=> { 
                    console.log(e.currentTarget.checked);
                    if(e.currentTarget.checked){
                        ss(d=> d.studio.panel={name:'inspect_nodes', show:true});
                    }else{ ss(d=> d.studio.panel.show=false); }
                }, 
                className: 'bi-boxes me-1',
            })
        )
    )
}

// function Inspect_Design(){ 
//     const d = useS.getState();
//     const [show, set_show] = useState(false);
//     const window_size = use_window_size();
//     const part = useS(d=> d.design.part);
//     const nodes = useS(d=> d.pick.nodes); 
//     const string_tags = useS(d=> d.inspect.string_tags);
//     const float_tags = useS(d=> d.inspect.float_tags);
//     const menu = useS(d=> d.studio.menu);
//     useEffect(()=>{
//         if(window_size.width>=576){
//             if(part && nodes.length==1 && nodes[0]==part){
//                 set_show(true);
//                 ss(d=> d.studio.menu = 'inspect_design');
//             }else{ set_show(false); }
//         }
//     },[nodes]);
//     function toggled(s){
//         if(s && part){
//             set_show(true);
//             ss(d=>{ d.pick.one(d, part); d.studio.menu = 'inspect_design'; });
//         }else{ set_show(false); }
//     }
//     //console.log('render inspector');
//     return (
//         c(Dropdown, {
//             id:'dropdownn',
//             show: show && menu=='inspect_design', 
//             onToggle:s=>toggled(s), 
//             autoClose:window_size.width<576, 
//             drop:'down-centered'
//         }, //, id:'inspect_workspace_part'
//             c(Dropdown.Toggle, {
//                 id:'coolmenbutton',
//                 className:'bi-box me-1', 
//                 variant:'outline-primary', size: 'lg', 
//                 disabled: part==null,
//             }, ' '), //fs-4 font size to increase icon size but need to reduce padding too
//             c(Dropdown.Menu, {id:'coolmenu'},
//                 part && c(Row, {className:'row-cols-auto gap-2 mb-3'},
//                     c(Col,{}, // might need to add key to keep things straight 
//                         c(Badge, {n:part})
//                     ) 
//                 ),
//                 ...string_tags.map(t=>
//                     c(String, {t:t})
//                 ),
//                 ...float_tags.map(t=>
//                     c(Float, {t:t})
//                 ),
//                 nodes.filter(n=>d.n[n].asset).length ? c('div', {className:''},
//                     c(Button, {
//                         variant: 'outline-secondary',
//                         onClick:e=>ssp(d=>{  // select function does not work inside produce because it has it's own produce 
//                             d.pick.delete(d);
//                         }),
//                     }, 'Delete'),
//                 ) : null,
//             )
//         )
//     )
// }


