import {createElement as r} from 'react';
import {ToggleButton, ButtonGroup} from 'boot';
import {useReactiveVar} from 'apollo';
import {draw_mode_var} from './editor.js';

export function Draw_Tool(p){
    const draw_mode = useReactiveVar(draw_mode_var);
    const mode_buttons = [
        {name:'Draw',          icon:'bi-pencil',      value:'draw'},
        {name:'Add Points',    icon:'bi-plus-circle', value:'add'},
        {name:'Delete Points', icon:'bi-dash-circle', value:'delete'},
    ];
    return(
        r(ButtonGroup, {}, 
            ...mode_buttons.map((button,i)=>
                r(ToggleButton,{
                    id: 'draw_mode_'+i,
                    type: 'radio',
                    variant: p.button_variant,
                    value: button.value,
                    checked: draw_mode == button.value,
                    onChange:(e)=> draw_mode_var(e.currentTarget.value),
                    className: button.icon,
                })
            ),
        )
    )
}