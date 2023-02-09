import {createElement as r} from 'react';
import {Row, Col, Button} from 'core/ui.js';

export function Toolbar(p){
    return(
        r('div', {className: 'position-absolute start-0 end-0 bottom-0'},
            r('div', {className: 'container-fluid text-center bottom-0 pt-2 pb-2 bg-body'},
                r(Row,{},[
                    r(Button,{text:'Undo', func:()=>p.set_action({name:'undo'})}),
                    r(Button,{text:'Redo', func:()=>p.set_action({name:'redo'})}),
                    r(Button,{text:'Greenware', func:()=>p.set_action({name:'greenware'})}),
                ].map((item)=>r(Col,{},item))),
            )
        )
    )
}