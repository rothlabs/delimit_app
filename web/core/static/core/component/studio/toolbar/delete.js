import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS} from '../../../app.js';

export function Delete(){ 
    const deletable = useS(d=> d.pick.deletable);
    const buttons = [
        {name:'Deep Delete',     icon:'bi-trash2-fill', action:'deep_delete'}, 
        {name:'Shallow Delete',  icon:'bi-trash2',      action:'shallow_delete'},
    ];
    const d = gs();
    return(
        deletable ? c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-secondary', size: 'lg',
                className: 'border-white ' + button.icon, 
                onClick:e=>ss(d=>{  
                    const nodes = [...d.pick.n];
                    nodes.forEach(n=> d.node.delete(d, n, {deep:button.action=='deep_delete'}));
                }),
            }),
        )) : null
    )
}