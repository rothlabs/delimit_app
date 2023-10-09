import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Container, Button, Form, InputGroup} from 'react-bootstrap';
import {ss, useS, readable} from '../../../app.js';
import {Buttons} from './buttons.js';

export function Float({t}){
    const content     = useS(d=> d.inspect.content[t]);
    const placeholder = useS(d=> d.inspect.placeholder[t]);
    const asset       = useS(d=> d.inspect.asset[t]);
    const [input_value, set_input_value] = useState(content);
    const [sync_input, set_sync_input] = useState(true);
    useEffect(()=>{
        if(sync_input) set_input_value(content);
    },[content]);
    return (
        content!=undefined && c(InputGroup, {className:'mb-2'}, 
            c(InputGroup.Text, {}, readable(t)),
            c(Form.Control, {
                maxLength:64, 
                value: input_value, 
                placeholder:placeholder, 
                disabled:!asset, 
                onFocus:()=> set_sync_input(false),
                onBlur:()=> set_sync_input(true),
                onChange:(e)=>{
                    if(!isNaN(e.target.value) || e.target.value=='.' || e.target.value=='-' || e.target.value=='-.'){
                        set_input_value(e.target.value);
                        ss(d=> d.pick.sv(d, t, e.target.value));
                    }
                }
            }),
            c(Button, {
                className: 'bi-symmetry-vertical',
                variant: 'outline-secondary',
                onClick:e=>ss(d=>{
                    d.node.get(d, d.pick.n, t).forEach(n => {
                        d.node.sv(d, n, -d.n[n].v);
                    });
                }),
            }),
            c(Buttons, {t:t}),
        )
    )
}

//const re = /^[0-9\b]+$/;
                //if (e.target.value === '' || re.test(e.target.value)) {