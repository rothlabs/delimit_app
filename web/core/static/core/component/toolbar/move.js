import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {set_store, use_store} from 'delimit';

export function Move(){
    const studio_mode = use_store(d=> d.studio.mode);
    const move_mode = use_store(d=> d.design.move.mode);
    const buttons = [
        {name:'Move', icon:'bi bi-arrows-move', value:'move'},
    ];
    return(
        studio_mode=='design' && c(ButtonToolbar, {}, 
            buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'move_mode_'+i,
                    type: 'checkbox',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: move_mode == button.value,
                    className: button.icon+ ' border-white',
                    onChange:e=> set_store(d=>{
                        if(d.design.move.mode == button.value){
                            d.design.move.mode = '';
                        }else{
                            d.design.move.mode = button.value;
                        }
                        d.next('design.update');
                    }),
                })
            ),
        )
    )
}