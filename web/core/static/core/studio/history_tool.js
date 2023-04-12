import {createElement as r} from 'react';
import {Button, ButtonGroup} from 'boot';
import {action_rv} from './editor.js';

export function History_Tool(p){
    const mode_buttons = [
        {name:'Undo',   icon:'bi-arrow-left',      act:'undo'},
        {name:'Redo',   icon:'bi-arrow-right',     act:'redo'},
        {name:'Revert', icon:'bi-arrow-clockwise', act:'revert'},
    ];
    return(
        r(ButtonGroup, {},
            ...mode_buttons.map(button=>
                r(Button,{
                    onClick:()=>action_rv({name:button.act}), 
                    variant: p.button_variant,
                    className: button.icon,
                })
            )
        )
    )
}