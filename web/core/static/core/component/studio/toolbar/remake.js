import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Remake(){ //Transmute Recast
    const same_nodes = useS(d=> d.pick.same);
    const splittable = useS(d=> d.pick.splittable);
    //const node  = useS(d=> d.pick.get_if_one(d));
    const buttons = [
        {name:'Deep Copy',   icon:'bi-file-earmark-fill', func(d){
            d.pick.nodes.forEach(n=> d.remake.copy(d, n, {deep:true}));
        }},
        {name:'Shallow Copy',  icon:'bi-file-earmark', func(d){
            d.pick.nodes.forEach(n=> d.remake.copy(d, n));
        }},
        {name:'Merge',  icon:'bi-arrows-angle-contract', disabled:!same_nodes, func(d){ // put button definitions like this in store
            d.remake.merge(d, d.pick.same.slice(0,-1),  d.pick.same.at(-1));//d.pick.merge(d);
        }},
        {name:'Split',  icon:'bi-arrows-angle-expand', disabled:!splittable, func(d){ // disabled: if nodes don't have any splittable r 
            d.remake.split(d, d.pick.nodes.slice(0,-1), d.pick.nodes.at(-1));
        }},
    ];
    //nodes.filter(n=>d.n[n].asset).length && 
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