import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, Form, InputGroup, Button} from 'react-bootstrap';
import {useS, ss, gs, readable} from '../../../app.js';

export function Buttons({t}){
    const d = gs();
    return (
        d.inspect.asset[t] && !d.atom_tags.includes(t) && c(Fragment, {}, 
            c(Button, {
                className: 'bi-x-lg',// + ' border-white',
                variant: 'outline-secondary',
                onClick(){ss(d=>{
                    [...d.pick.n].forEach(r=>{
                        const n = d.node.get(d,r,t);
                        if(d.node.cr(d, n).length > 1){
                            d.delete.edge(d, r, n, t);
                        }else{
                            d.delete.node(d, n);
                        }
                    });
                })},
            }),
        )
    )
}