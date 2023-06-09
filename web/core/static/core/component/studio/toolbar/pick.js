import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Pick(){
    const deep = useS(d=> d.pick.deep);
    const multi = useS(d=> d.pick.multi);
    const buttons = [
        {name:'Deep', icon:'bi-cursor-fill', checked:deep, func(d){
            d.pick.deep = !d.pick.deep;
            if(d.design.mode == 'erase') d.design.mode = '';
        }},
        {name:'Multi', icon:'bi-cursor', checked:multi, func(d){
            d.pick.multi = !d.pick.multi;
            if(d.design.mode == 'erase') d.design.mode = '';
        }},
    ];
    return(
        c(ButtonToolbar, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'pick_mode_'+i,
                    type: 'checkbox',
                    variant: 'outline-primary', size: 'lg',
                    checked: button.checked,
                    className: button.icon + ' border-white',
                    onChange:e=> ss(d=> button.func(d)),
                })
            ),
        )
    )
}



// onChange:e=> ss(d=>{ 
                    //     if(d.pick.mode == e.currentTarget.value){
                    //         d.pick.mode = '';
                    //     }else{
                    //         d.pick.mode = e.currentTarget.value;
                    //     }
                    //     if(d.design.mode == 'erase') d.design.mode = '';
                    // }), 

//if(['draw','erase'].includes(d.design.mode)) d.design.mode = '';