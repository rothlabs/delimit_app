import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Container, Button, Form, InputGroup} from 'react-bootstrap';
import {ss, useS, readable} from '../../../app.js';
import {Buttons} from './buttons.js';

export function Boolean({t}){
    const content = useS(d=> d.inspect.content[t]);
    const asset = useS(d=> d.inspect.asset[t]);
    return (
        content!=undefined && c(InputGroup, {className:'mb-2'}, 
            c(Form.Check, {
                className:'flex-grow-1 ms-2 mt-2', //4 mt-2 me-4 
                //style: {transform:'scale(1.8);'},
                type:     'switch',
                label:    readable(t), 
                disabled: !asset, 
                checked:  content, 
                onChange: e=> ss(d=> d.pick.sv(d, t, e.target.checked)),
            }),
            c(Buttons, {t:t}),
        )
    )
}