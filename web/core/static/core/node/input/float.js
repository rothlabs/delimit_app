import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Container, Form, InputGroup} from 'boot';
import {useD, readable} from '../../app.js';

export function Float({t}){
    const content   = useD(d=> d.inspect.content[t]);
    const placeholder = useD(d=> d.inspect.placeholder[t]);
    const asset = useD(d=> d.inspect.asset[t]);
    return (
        content!=undefined && c(InputGroup, {className:'mb-3'}, 
            c(InputGroup.Text, {}, readable(t)),
            c(Form.Control, {maxLength:64, value:content, placeholder:placeholder, disabled:!asset, onChange:(e)=>{
                if(!isNaN(e.target.value) || e.target.value=='.'){
                    useD.getState().selected.edit_val(t, e.target.value);
                }
            }}),
        )
    )
}

//const re = /^[0-9\b]+$/;
                //if (e.target.value === '' || re.test(e.target.value)) {