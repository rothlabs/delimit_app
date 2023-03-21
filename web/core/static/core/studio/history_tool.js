import {createElement as r} from 'react';
import {Row, Col, Button, ButtonGroup, Container} from 'boot';
import {history_action} from './editor.js';

export function History_Tool(p){
    return(
        r(ButtonGroup, {}, //, role:'group', arialabel:'History' className: 'position-absolute'
            r(Button,{onClick:()=>history_action({name:'undo'}), variant:'outline-primary'}, r('i',{className:'bi-arrow-left'}),  ' Undo'), //p.set_act({name:'undo'})
            r(Button,{onClick:()=>history_action({name:'redo'}), variant:'outline-primary'}, r('i',{className:'bi-arrow-right'}), ' Redo'),
            r(Button,{onClick:()=>history_action({name:'revert'}), variant:'outline-primary', disabled:true}, r('i',{className:'bi-arrow-clockwise'}), ' Revert'),
            // r(Button,{onClick:()=>{
            //     var hi = history_index() - 1;
            //     if(hi < 0) hi = 0;
            //     history_index(hi);
            // }, variant:'outline-primary'}, r('i',{className:'bi-arrow-left'}),  ' Undo'), //p.set_act({name:'undo'})
            // r(Button,{onClick:()=>{
            //     var hi = history_index() + 1;
            //     if(hi > 5) hi = 5;
            //     history_index(hi);
            // }, variant:'outline-primary'}, r('i',{className:'bi-arrow-right'}), ' Redo'),
            // r(Button,{onClick:()=>history_index(0), variant:'outline-primary', disabled:true}, r('i',{className:'bi-arrow-clockwise'}), ' Revert'),
        )
    )
}

//r('div', {className: 'position-absolute start-0 end-0'},
           // r('div', {className: 'container-fluid pb-2 bg-body'}, //text-center
            //r(Container, {fluid:true, pb:5, className:'pb-2 bg-body'},

            //r(Row,{},//[
            //)
                //].map((n,i)=>r(Col,{key:i},n)))