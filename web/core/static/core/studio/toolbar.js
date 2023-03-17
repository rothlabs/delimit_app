import {createElement as r} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'boot';
import {History_Tool} from './history_tool.js';
import {File_Tool} from './file_tool.js';

export function Toolbar(p){
    return(
        r(Container, {fluid:true, className:'bg-light'}, // pb:5,
            r(Row,{className:'row-cols-auto'},
                r(Col,{}, r(File_Tool, {...p})),
                r(Col,{}, r(History_Tool)),
            )
        )
    )
}

//r('div', {className: 'position-absolute start-0 end-0'},
           // r('div', {className: 'container-fluid pb-2 bg-body'}, //text-center