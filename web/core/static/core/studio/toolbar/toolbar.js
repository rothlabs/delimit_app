import {createElement as c} from 'react';
import {Row, Col, Container} from 'boot';
import {Inspect} from './inspect/inspect.js';
import {History} from './history.js';
import {Instrument} from './instrument.js';
import {Visual} from './visual.js';


export function Toolbar(){
    const tools = [Inspect, Visual, History, Instrument];
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