import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Pick(){
    const mode = useS(d=> d.pick.mode);
    const buttons = [
        {name:'One',   icon:'bi-cursor',      value:'one'},
        {name:'Multi', icon:'bi-cursor-fill', value:'multi'},
    ];
    return(
        c(ButtonToolbar, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'pick_mode_'+i,
                    type: 'checkbox',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: mode == button.value,
                    className: button.icon + ' border-white',
                    onChange:e=> ss(d=>{ 
                        if(d.pick.mode == e.currentTarget.value){
                            d.pick.mode = '';
                        }else{
                            d.pick.mode = e.currentTarget.value;
                        }
                        if(d.design.mode == 'erase') d.design.mode = '';
                        //if(['draw','erase'].includes(d.design.mode)) d.design.mode = '';
                    }), 
                })
            ),
        )
    )
}