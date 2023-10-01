import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Container, Button, Form, InputGroup} from 'react-bootstrap';
import {ss, useS, readable} from '../../../app.js';
import {Buttons} from './buttons.js';

export function Bool({t}){
    const content = useS(d=> d.inspect.content[t]);
    const asset = useS(d=> d.inspect.asset[t]);
    return (
        content!=undefined && c(InputGroup, {className:'mb-3'}, 
            c(Form.Check, {
                className:'mt-2 me-4', 
                label: readable(t), 
                disabled:!asset, 
                checked: content, 
                onChange:e=> ss(d=> d.pick.sv(d, t, e.target.checked)),
            }),
            c(Buttons, {t:t}),
        )
    )
}