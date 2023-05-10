import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'boot';
import {useD} from '../../app.js';

export function Select(){
    const multiselect = useD(d=> d.multiselect);
    return(
        c(ButtonGroup, {}, 
            c(ToggleButton,{
                id: 'multiselect',
                type: 'checkbox',
                variant: 'outline-primary', size: 'lg',
                checked: multiselect,
                value: '1',
                onChange:(e)=> {
                    //console.log(e.currentTarget.value);
                    useD.getState().set(d=>{  d.multiselect = !multiselect;  });
                }, 
                className: 'bi-cursor',
            })
        )
    )
}