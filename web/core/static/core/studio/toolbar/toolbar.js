import {createElement as c} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup} from 'boot';
import {Inspect} from './inspect/inspect.js';
import {History} from './history.js';
import {Instrument} from './instrument.js';
import {Visual} from './visual.js';
import {useD} from '../../app.js';


export function Toolbar(){
    const tools = [Inspect, Visual, History, Multiselect, Instrument];
    return(
        c(Container, {fluid:true, className:'bg-white pt-2 pb-2'}, // pb:5,
            c(Row,{className:'row-cols-auto gap-2'},
                ...tools.map(tool => 
                    c(Col,{}, c(tool)),
                )
            )
        )
    )
}

function Multiselect(){
    const multiselect = useD(d=> d.multiselect);
    return(
        c(ButtonGroup, {}, 
            c(ToggleButton,{
                id: 'multiselect',
                type: 'checkbox',
                variant: 'outline-primary',
                checked: multiselect,
                value: '1',
                onChange:(e)=> {
                    console.log(e.currentTarget.value);
                    useD.getState().set(d=>{  d.multiselect = !multiselect;  });
                }, 
                className: 'bi-cursor',
            })
        )
    )
}