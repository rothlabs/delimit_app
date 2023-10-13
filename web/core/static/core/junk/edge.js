import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

// edge slice with add and remove functions

export function Edge(){ //Transmute Recast
    const addable = useS(d=> d.pick.addable);
    const removable = useS(d=> d.pick.removable);
    var buttons = [
        {name:'Add',  icon:'bi-box-arrow-in-up-right', disabled:!addable, func(d){ // put button definitions like this in store ?
            // automatically figure out what it is mostly being used as and set tag from that. Could provide options to user as well
            const r = d.pick.target;
            d.pick.group.forEach(n=>{
                if(!d.graph.stem(d, n, {deep:true}).includes(r)) d.make.edge(d, r, n);
            }); 
        }},
        {name:'Remove',  icon:'bi-box-arrow-up-right', disabled:!removable, func(d){ 
            const edges = [];
            d.node.delete_edges(d, edges);// d.edge.delete();
        }},
    ];
    return(
        c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-primary', size: 'lg',
                className: 'border-white ' + button.icon, 
                disabled: button.disabled,
                onClick:e=> ss(d=> button.func(d)),
            }),
        ))
    )
}