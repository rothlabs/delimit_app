import {createElement as c} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';

export function History(p){
    const mode_buttons = [
        {name:'Undo',   icon:'bi-arrow-left',      act:'undo'},
        {name:'Redo',   icon:'bi-arrow-right',     act:'redo'},
        {name:'Revert', icon:'bi-arrow-clockwise', act:'revert'},
    ];
    return(
        c(ButtonGroup, {},
            ...mode_buttons.map(button=>
                c(Button,{
                    //onClick:()=>action_rv({name:button.act}), 
                    variant: 'outline-primary', size: 'lg',
                    className: button.icon+ ' border-white',
                })
            )
        )
    )
}