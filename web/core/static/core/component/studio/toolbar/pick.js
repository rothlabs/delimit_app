import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Pick(){
    const multi = useS(d=> d.pick.multi);
    return(
        c(ButtonGroup, {}, 
            c(ToggleButton,{
                id: 'pick_multi',
                type: 'checkbox',
                variant: 'outline-primary', size: 'lg',
                checked: multi,
                value: '1',
                onChange:(e)=> {
                    ss(d=> d.pick.multi = !multi );
                }, 
                className: 'bi-cursor border-white',
            })
        )
    )
}