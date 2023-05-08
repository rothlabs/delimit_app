import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Container, Form, InputGroup} from 'boot';
import {useD, readable} from '../../app.js';

export function Float({t}){
    const val = useD(d=> d.inspect.c[t]);
    return (
        val!=undefined && c(InputGroup, {className:'mb-3'}, 
            c(InputGroup.Text, {}, readable(t)),
            c(Form.Control, {maxLength:64, value:val, onChange:(e)=>{
                if(!isNaN(e.target.value) || e.target.value=='.'){
                    var float_val = +e.target.value;
                    if(isNaN(float_val)) float_val = 0;
                    useD.getState().mutate(d=>{//d.selected.edit(d, 'name', e.target.value);
                        d.inspect.c[t] = e.target.value;
                        d.selected.nodes.forEach(n => {
                            if(d.n[n].m=='p' && d.n[n].n[t]) {
                                d.n[d.n[n].n[t][0]].v = float_val;
                                d.n[n].c[t] = float_val;
                            }
                        });
                    });
                }
            }}),
        )
    )
}

//const re = /^[0-9\b]+$/;
                //if (e.target.value === '' || re.test(e.target.value)) {