import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, Form, InputGroup, Button} from 'react-bootstrap';
import {useS, ss, gs, readable} from '../../../app.js';

export function Buttons({t}){
    const asset = useS(d=> d.inspect.asset[t]);
    const mergeable = useS(d=> d.inspect.mergeable[t]);
    const splittable = useS(d=> d.inspect.splittable[t]);
    const d = gs();
    var buttons = [];
    if(mergeable) buttons.push({name:'Merge', icon:'bi-arrows-angle-contract', func(d){
        const n = d.node.get(d, d.pick.n, t); 
        d.remake.merge(d, n.slice(0,-1),  n.at(-1));
    }});
    if(splittable) buttons.push({name:'Split', icon:'bi-arrows-angle-expand', func(d){
        const group = d.node.get(d, d.pick.n, t);
        d.pick.n.forEach(target=> d.remake.split(d, group, target));
    }});
    if(!d.atom_tags.includes(t)) buttons.push({name:'Remove', icon:'bi-x-lg', func(d){
            [...d.pick.n].forEach(r=>{
                d.node.get(d,r,t).forEach(n=>{
                    d.delete.edge_or_node(d,r,n,t);
                    // if(d.node.cr(d, n).length > 1){
                    //     //console.log('edge only?');
                    //     d.delete.edge(d, r, n, t);
                    // }else{
                    //     //console.log('delete node for some reason?');
                    //     d.delete.node(d, n);
                    // }
                });
            });
    }});
    return (
        asset && c(Fragment, {}, 
            ...buttons.map((button,i)=>
                c(Button, {
                    className: button.icon,
                    variant: 'outline-secondary',
                    onClick:e=> ss(d=> button.func(d)),
                }),
            ),
        )
    )
}