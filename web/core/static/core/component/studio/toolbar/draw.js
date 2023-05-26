import {createElement as c} from 'react';
import {ToggleButton, ButtonGroup} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Draw(){
    const studio_mode = useS(d=> d.studio.mode);
    const board_mode = useS(d=> d.board.mode);
    const buttons = [
        {name:'Draw',  icon:'bi-pencil', value:'draw'},
        {name:'Erase', icon:'bi-eraser', value:'erase'},
    ];
    return(
        studio_mode=='design' && c(ButtonGroup, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'board_mode_'+i,
                    type: 'radio',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: board_mode == button.value,
                    className: button.icon+ ' border-white',
                    onChange:e=> ss(d=>{
                        d.board.mode = e.currentTarget.value;
                        d.pick.mode = '';
                    }),
                })
            ),
        )
    )
}