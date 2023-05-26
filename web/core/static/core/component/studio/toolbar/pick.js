import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Pick(){
    const mode = useS(d=> d.pick.mode);
    const buttons = [
        {name:'One',   icon:'bi-cursor',      value:'one'},
        {name:'Multi', icon:'bi-cursor-fill', value:'multi'},
    ];
    return(
        c(ButtonGroup, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'pick_mode_'+i,
                    type: 'radio',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: mode == button.value,
                    className: button.icon + ' border-white',
                    onChange:e=> ss(d=>{ 
                        d.pick.mode = e.currentTarget.value
                        d.board.mode = '';
                    }), 
                })
            ),
        )
    )
}