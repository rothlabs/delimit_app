import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Delete(){ 
    const buttons = [
        {name:'Deep Delete',     icon:'bi-trash2-fill', action:'deep_delete'}, 
        {name:'Shallow Delete',  icon:'bi-trash2',      action:'shallow_delete'},
    ];
    return(
        c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-secondary', size: 'lg',
                className: 'border-white ' + button.icon, 
                onClick:e=>ss(d=>{  
                    d.pick.delete(d, button.action=='deep_delete');
                }),
            }),
        ))
    )
}