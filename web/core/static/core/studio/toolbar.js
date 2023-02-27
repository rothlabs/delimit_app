import {createElement as r} from 'react';
import {Row, Col, Button} from 'core/ui.js';

export function Toolbar(p){
    return(
        r('div', {key: 0, className: 'position-absolute start-0 end-0 bottom-0'},
            r('div', {key:1, className: 'container-fluid text-center bottom-0 pt-2 pb-2 bg-body'},
                r(Row,{},[
                    r(Button,{text:'Undo', func:()=>p.set_act({name:'undo'})}),
                    r(Button,{text:'Redo', func:()=>p.set_act({name:'redo'})}),
                    r(Button,{text:'Greenware', func:()=>p.set_act({name:'greenware'})}),
                    r(Button,{text:'Change URL', func:()=>{
                        window.history.pushState('state_object', '', '/coolpage');
                    }}),
                ].map((item,i)=>r(Col,{key:i},item)))
            )
        )
    )
}