import {createElement as c} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {undo, redo} from '../../app.js';

export function History(){
    const mode_buttons = [
        {name:'Undo',   icon:'bi bi-arrow-left',  func:undo},
        {name:'Redo',   icon:'bi bi-arrow-right', func:redo},
        //{name:'Revert', icon:'bi-arrow-clockwise', act:'revert'},
    ];
    return(
        c(ButtonGroup, {},
            ...mode_buttons.map(button=>
                c(Button,{
                    variant: 'outline-primary', size: 'lg',
                    className: button.icon + ' border-white',
                    onClick:()=> button.func(), 
                })
            )
        )
    )
}