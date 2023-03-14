import {createElement as r} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'boot';
import {history_action} from './editor.js';

export function History_Control(p){
    return(
        //r('div', {className: 'position-absolute start-0 end-0'},
           // r('div', {className: 'container-fluid pb-2 bg-body'}, //text-center
            //r(Container, {fluid:true, pb:5, className:'pb-2 bg-body'},
            r(ButtonGroup, {role:'group', arialabel:'History', className: 'position-absolute'},
                //r(Row,{},//[
                    r(Button,{onClick:()=>history_action({name:'undo'})}, 'Undo'), //p.set_act({name:'undo'})
                    r(Button,{onClick:()=>history_action({name:'redo'})}, 'Redo'),
                    r(Button,{onClick:()=>console.log('button press')}, 'Test'),
                //)
                //].map((n,i)=>r(Col,{key:i},n)))
            )
        //)
    )
}