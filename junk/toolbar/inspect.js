import {createElement as c} from 'react';
import {ButtonToolbar, ToggleButton} from 'react-bootstrap';
import {ss, gs, useS} from '../../app.js';

export function Inspect(){ 
    const panel = useS(d=> d.studio.panel.mode);
    const show = useS(d=> d.studio.panel.show);
    const part = useS(d=> d.design.part);
    const nodes = useS(d=> d.pick.n); 
    //console.log('render inspector');
    return (
        c(ButtonToolbar, {}, 
            c(ToggleButton,{
                id: 'open_inspect_design_panel',
                type: 'checkbox', // change to radio?
                variant: 'outline-primary', size: 'lg',
                checked: show && panel=='inspect_design',
                //value: '1',
                onChange:(e)=> { 
                    if(part && e.currentTarget.checked){ 
                        ss(d=> {d.studio.panel={name:'inspect_design', show:true}; d.pick.one(d, part);});
                    }else{ ss(d=> d.studio.panel.show=false); }
                }, 
                className: 'bi bi-box border-white',
                disabled: part==null,
            }),
            c(ToggleButton,{
                id: 'open_inspect_nodes_panel',
                type: 'checkbox',
                variant: 'outline-primary', size: 'lg',
                checked: show && panel=='inspect_nodes',
                //value: '2',
                onChange:(e)=> { 
                    if(nodes.length && e.currentTarget.checked){
                        ss(d=> d.studio.panel={name:'inspect_nodes', show:true});
                    }else{ ss(d=> d.studio.panel.show=false); }
                }, 
                className: 'bi bi-boxes border-white',
                disabled: nodes.length<1 || (part && nodes.length==1 && nodes[0]==part),
            })
        )
    )
}

// function Inspect_Design(){ 
//     const d = useS.getState();
//     const [show, set_show] = useState(false);
//     const window_size = use_window_size();
//     const part = useS(d=> d.design.part);
//     const nodes = useS(d=> d.pick.n); 
//     const string_tags = useS(d=> d.inspect.string_tags);
//     const decimal_tags = useS(d=> d.inspect.decimal_tags);
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
//                 ...decimal_tags.map(t=>
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


