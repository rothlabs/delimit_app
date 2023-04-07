import {createElement as r} from 'react';
import {Button, ButtonGroup} from 'boot';
import {editor_action} from './editor.js';

export function History_Tool(p){
    const mode_buttons = [
        {name:'Undo',   icon:'bi-arrow-left',      action:'undo'},
        {name:'Redo',   icon:'bi-arrow-right',     action:'redo'},
        {name:'Revert', icon:'bi-arrow-clockwise', action:'revert'},
    ];
    return(
        r(ButtonGroup, {},
            ...mode_buttons.map(button=>
                r(Button,{
                    onClick:()=>editor_action({name:button.action}), 
                    variant: p.button_variant,
                    className: button.icon,
                })
            )
        )
    )
}