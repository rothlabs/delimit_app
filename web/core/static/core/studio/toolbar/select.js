import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'boot';
import {ss, useD} from '../../app.js';

export function Select(){
    const multiselect = useD(d=> d.pick.multiselect);
    return(
        c(ButtonGroup, {}, 
            c(ToggleButton,{
                id: 'multiselect',
                type: 'checkbox',
                variant: 'outline-primary', size: 'lg',
                checked: multiselect,
                value: '1',
                onChange:(e)=> {
                    ss(d=> d.pick.multiselect = !multiselect );
                }, 
                className: 'bi-cursor',
            })
        )
    )
}