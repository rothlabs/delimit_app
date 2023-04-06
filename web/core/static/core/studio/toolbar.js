import {createElement as r, useState, Fragment} from 'react';
import {Row, Col, Button, ButtonGroup, Container, Form} from 'boot';
import {History_Tool} from './history_tool.js';
import {File_Tool} from './file_tool.js';
import {editor_action, show_points_var} from './editor.js';

const button_variant = 'outline-primary';

export function Toolbar(p){
    return(
        r(Container, {fluid:true, className:'bg-light'}, // pb:5,
            r(Row,{className:'row-cols-auto'},
                r(Col,{}, r(File_Tool,    {button_variant:button_variant, ...p})),
                r(Col,{}, r(History_Tool, {button_variant:button_variant})),
                r(Col,{}, r(Vertex_Tool,  {button_variant:button_variant})),
            )
        )
    )
}

function Vertex_Tool(p){
    const [show_verts, set_show_verts] = useState(true);
    return(
        r(Row,{className:'row-cols-auto'},
            //r('p', {}, 'Vertex'),
            r(Col,{}, r(ButtonGroup, {}, //, role:'group', arialabel:'History' className: 'position-absolute'
                r(Button,{
                    onClick:()=>editor_action({name:'add_points'}),    
                    variant:p.button_variant,
                    disabled: true,
                }, r('i',{className:'bi-plus-square-dotted'}), ' Add'),
                r(Button,{
                    onClick:()=>editor_action({name:'delete_points'}), 
                    variant:p.button_variant
                }, r('i',{className:'bi-dash-square-dotted'}),  ' Delete'), //p.set_act({name:'undo'})
            )),
            r(Col,{}, r(Form.Check, {
                onChange:(e)=>{
                    set_show_verts(e.target.checked);
                    show_points_var(e.target.checked);
                    //editor_action({name:'show_points', show:e.target.checked})
                }, 
                className:'mt-2', 
                label:'Show Verts', 
                checked:show_verts, 
            })),
        )
    )
}

//r('div', {className: 'position-absolute start-0 end-0'},
           // r('div', {className: 'container-fluid pb-2 bg-body'}, //text-center