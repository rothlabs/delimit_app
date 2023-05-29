import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Draw(){
    const studio_mode = useS(d=> d.studio.mode);
    const design_mode = useS(d=> d.design.mode);
    const buttons = [
        {name:'Draw',  icon:'bi-pencil', value:'draw'},
        {name:'Erase', icon:'bi-eraser', value:'erase'},
        {name:'Move', icon:'bi-arrows-move', value:'move'},
    ];
    return(
        studio_mode=='design' && c(ButtonGroup, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'design_mode_'+i,
                    type: 'radio',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: design_mode == button.value,
                    className: button.icon+ ' border-white',
                    onChange:e=> ss(d=>{
                        d.design.mode = e.currentTarget.value;
                        if(['draw','erase'].includes(d.design.mode)) d.pick.mode = '';
                    }),
                })
            ),
        )
    )
}