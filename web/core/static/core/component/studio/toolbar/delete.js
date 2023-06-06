import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS} from '../../../app.js';

export function Delete(){ 
    const nodes = useS(d=> d.pick.nodes); 
    const buttons = [
        {name:'Deep Delete',     icon:'bi-trash2-fill', action:'deep_delete'}, 
        {name:'Shallow Delete',  icon:'bi-trash2',      action:'shallow_delete'},
    ];
    const d = gs();
    return(
        nodes.filter(n=>d.n[n].asset).length ? c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-secondary', size: 'lg',
                className: 'border-white ' + button.icon, 
                onClick:e=>ss(d=>{  
                    const nodes = [...d.pick.nodes];
                    nodes.forEach(n=> d.node.delete(d, n, {deep:button.action=='deep_delete'}));
                }),
            }),
        )) : null
    )
}