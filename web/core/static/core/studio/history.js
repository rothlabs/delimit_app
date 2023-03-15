import {createElement as r} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'boot';
import {history_action} from './editor.js';

export function History_Tool(p){
    return(
        r(ButtonGroup, {role:'group', arialabel:'History'}, //, className: 'position-absolute'
            r(Button,{onClick:()=>history_action({name:'undo'}), variant:'outline-primary'}, r('i',{className:'bi-caret-left-square-fill'}),  ' Undo'), //p.set_act({name:'undo'})
            r(Button,{onClick:()=>history_action({name:'redo'}), variant:'outline-primary'}, r('i',{className:'bi-caret-right-square-fill'}), ' Redo'),
        )
    )
}

//r('div', {className: 'position-absolute start-0 end-0'},
           // r('div', {className: 'container-fluid pb-2 bg-body'}, //text-center
            //r(Container, {fluid:true, pb:5, className:'pb-2 bg-body'},

            //r(Row,{},//[
            //)
                //].map((n,i)=>r(Col,{key:i},n)))