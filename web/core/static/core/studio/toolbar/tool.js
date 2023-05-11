import {createElement as r} from 'react';
import {ToggleButton, ButtonGroup} from 'boot';
import {useS} from '../../app.js';
//import {draw_mode_rv} from './studio.js';

export function Tool(){
    //const draw_mode = useReactiveVar(draw_mode_rv);
    const mode = useS(d=> d.studio.mode);
    const mode_buttons = [
        {name:'Draw',          icon:'bi-pencil',      value:'draw'},
        {name:'Add Points',    icon:'bi-plus-circle', value:'add'},
        {name:'Delete Points', icon:'bi-dash-circle', value:'delete'},
    ];
    return(
        mode=='design' && r(ButtonGroup, {}, 
            ...mode_buttons.map((button,i)=>
                r(ToggleButton,{
                    id: 'draw_mode_'+i,
                    type: 'radio',
                    variant: 'outline-primary', size: 'lg',
                    //value: button.value,
                    //checked: draw_mode == button.value,
                    //onChange:(e)=> draw_mode_rv(e.currentTarget.value),
                    className: button.icon,
                })
            ),
        )
    )
}