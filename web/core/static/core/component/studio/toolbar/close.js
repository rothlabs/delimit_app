import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS} from '../../../app.js';

export function Close(){ 
    const buttons = [
        {name:'Close', icon:'bi-x-lg', func(d){
            const nodes = [...d.pick.n, ...d.node.n(d, d.pick.n, {deep:true})];
            d.close(d, nodes); // need patch adjust in app.js to open_pack on undo ?!?!?!?!
        }},
    ];
    const d = gs();
    return(
        c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-secondary', size: 'lg',
                className: 'border-white ' + button.icon, 
                onClick:e=>ss(d=> button.func(d)),
            }),
        ))
    )
}