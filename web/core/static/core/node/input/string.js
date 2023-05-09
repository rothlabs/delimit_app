import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Container, Form, InputGroup} from 'boot';
import {useD, readable} from '../../app.js';

const area_tags = ['story'];

export function String({t}){
    const content   = useD(d=> d.inspect.content[t]);
    const placeholder = useD(d=> d.inspect.placeholder[t]);
    const asset = useD(d=> d.inspect.asset[t]);
    return (
        content!=undefined && c(InputGroup, {className:'mb-3'}, 
            c(InputGroup.Text, {}, readable(t)),
            c(Form.Control, {
                as:area_tags.includes(t)?'textarea':'input', 
                maxLength:64, 
                value:content, 
                placeholder:placeholder, 
                disabled:!asset, 
                onChange:(e)=> useD.getState().selected.edit_val(t, e.target.value),
            }),
        )
    )
}


// useD.getState().mutate(d=>{//d.selected.edit(d, 'name', e.target.value);
//     d.inspect.c[t] = e.target.value;
//     d.selected.nodes.forEach(n => {
//         if(d.n[n].m=='p' && d.n[n].n[t]) {
//             d.n[d.n[n].n[t][0]].v = e.target.value;
//             d.n[n].c[t] = e.target.value;
//         }
//     });
// });