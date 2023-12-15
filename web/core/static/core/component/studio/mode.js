import {createElement as c} from 'react';
import {Mode_Menu} from 'delimit';

const items = [
    {name:'Repo',    css_cls:'bi-box-seam',       mode:'repo'},
    {name:'Graph',   css_cls:'bi-diagram-3',      mode:'graph'},
    {name:'Scene',   css_cls:'bi-pencil-square',  mode:'design'}, // design_part==null
    {name:'Code',    css_cls:'bi-braces',         mode:'code'},
];

export function Studio_Mode(){
    return c(Mode_Menu, {
        state: d => d.studio.mode,
        action: (d, mode) => d.studio.mode = mode,
        items, 
        width: 110, 
    });
}


// mode_buttons.map((button,i)=>
//                 c(ToggleButton,{
//                     id: 'studio_mode'+i,
//                     className: button.icon + ' border-0 rounded-4 rounded-top-0',
//                     type: 'radio',
//                     variant: 'outline-primary', //size: 'lg',
//                     value: button.value,
//                     checked: studio_mode == button.value,
//                     onChange:e=> set_store(d=>{
//                         d.studio.mode = e.currentTarget.value
//                         // if(d.studio.mode == 'design'){
//                         //     d.design.show(d); // should this be in NEXT statement ?!?!?!?!?!
//                         //     d.next('design.update'); 
//                         // }
//                     }),
//                     disabled: button.disabled,
//                 }, 
//                     (window_width > 576) ? button.name : '',
//                 )
//             )

//}, c('span',{style:{fontSize:'18px'}}, window_size.width>576 ? button.name : '')) //c('span',{className:'align-baseline'},button.name)