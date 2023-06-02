import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Remake(){ //Transmute Recast
    const same_nodes = useS(d=> d.pick.same);
    //const node  = useS(d=> d.pick.get_if_one(d));
    const buttons = [
        {name:'Merge',  icon:'bi-arrows-angle-contract', disabled:!same_nodes, func(d){ // put button definitions like this in store
            d.remake.merge(d);
        }},
        {name:'Split',  icon:'bi-arrows-angle-expand', disabled:false, func(d){
            d.remake.split(d);
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

//bi-sign-merge-left