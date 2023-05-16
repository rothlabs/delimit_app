import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Dropdown, Container, Form, ButtonGroup, Button, ToggleButton} from 'react-bootstrap';
import {ss, ssp, gs, useS, use_window_size} from '../../app.js';
import { Inspect } from './inspect.js';

export function Panel(){ 
    const window_size = use_window_size();
    const nodes = useS(d=> d.pick.nodes); 
    useEffect(()=>{
        if(window_size.width>=576){
            if(nodes.length){
                ss(d=> d.studio.panel={name:'inspect', show:true});
            }else{ ss(d=> d.studio.panel.show=false); }
        }
    },[nodes]);
    return (
        c(Container, {fluid:true, className:'bg-white pt-2 pb-2'}, 
            c(Inspect),
        )
    )
}