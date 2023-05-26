import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Pick(){
    const multi = useS(d=> d.pick.multi);
    const buttons = [
        {name:'One',   icon:'bi-cursor',      value:'one'},
        {name:'Multi', icon:'bi-cursor-fill', value:'multi'},
    ];
    return(
        c(ButtonGroup, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'pick_multi',
                    type: 'radio',
                    variant: 'outline-primary', size: 'lg',
                    checked: multi,
                    value: '1',
                    onChange:(e)=> {
                        ss(d=> d.pick.multi = !multi );
                    }, 
                    className: 'bi-cursor border-white',
                })
            ),
        )
    )
}