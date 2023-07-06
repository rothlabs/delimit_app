import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../app.js';

export function Move(){
    const studio_mode = useS(d=> d.studio.mode);
    const move_mode = useS(d=> d.design.move_mode);
    const buttons = [
        {name:'Move', icon:'bi bi-arrows-move', value:'move'},
    ];
    return(
        studio_mode=='design' && c(ButtonToolbar, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'move_mode_'+i,
                    type: 'checkbox',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: move_mode == button.value,
                    className: button.icon+ ' border-white',
                    onChange:e=> ss(d=>{
                        if(d.design.move_mode == button.value){
                            d.design.move_mode = '';
                        }else{
                            d.design.move_mode = button.value;
                        }
                        d.next('design.update');
                    }),
                })
            ),
        )
    )
}