import {createElement as c} from 'react';
import {Mode_Menu} from 'delimit';

const items = [
    {name:' Make',    cls:'bi-plus-square', value:'make'},
    {name:' Inspect', cls:'bi-menu-button', value:'inspect'}, 
    {name:' Schema',  cls:'bi-ui-checks',   value:'schema'},
    {name:' Modules', cls:'bi-boxes',       value:'modules'},
    {name:' Display', cls:'bi-eye',         value:'display'}, 
];

export function Panel_Mode(){
    return c(Mode_Menu, {
        state: d => d.studio.panel.mode,
        action: (d, v) => d.studio.panel.mode = v,
        items, 
        width: 45, 
        height: 45, 
        show_name: false,
    });
}

// import {ToggleButton} from 'react-bootstrap';
// import {use_store, set_store} from 'delimit';

// export function Panel_Bar(){
//     //console.log('render panel bar');
//     const panel_mode = use_store(d=> d.studio.panel.mode);
//     const panel_mode_buttons = [
//         {name:'Make',    icon:'bi-plus-square', value:'make'},
//         {name:'Inspect', icon:'bi-menu-button', value:'inspect'}, 
//         {name:'Schema',  icon:'bi-ui-checks',   value:'schema'},
//         {name:'Modules', icon:'bi-boxes',       value:'modules'},
//         {name:'Display', icon:'bi-eye',         value:'display'}, 
//     ];
//     return panel_mode_buttons.map(({name, icon, disabled, value}, i)=>
//         c(ToggleButton, {
//             id: 'panel_bar_'+name,
//             className: icon + ' border-0 rounded-end-pill ',// + (i==0 ? 'pt-4' : ''), // + (i==buttons.length-1 ? ' flex-grow-1' : ''),
//             type: 'checkbox', 
//             variant: 'outline-primary', size: 'lg',
//             disabled,
//             value,
//             checked: panel_mode == value,
//             onChange:e=> set_store(d=>{
//                 if(panel_mode == value){
//                     d.studio.panel.mode = '';
//                 }else{
//                     d.studio.panel.mode = value;
//                 }
//             }),
//         })
//     )
// }

