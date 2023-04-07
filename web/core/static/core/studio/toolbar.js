import {createElement as r, useState, Fragment} from 'react';
import {Row, Col, Button, ToggleButton, ButtonGroup, Container, Form} from 'boot';
import {History_Tool} from './history_tool.js';
import {File_Tool} from './file_tool.js';
import {useReactiveVar} from 'apollo';
import {editor_action, show_points_var, draw_mode_var} from './editor.js';

const button_variant = 'outline-primary';

export function Toolbar(p){
    return(
        r(Container, {fluid:true, className:'bg-light'}, // pb:5,
            r(Row,{className:'row-cols-auto'},
                r(Col,{}, r(File_Tool,    {button_variant:button_variant, ...p})),
                r(Col,{}, r(History_Tool, {button_variant:button_variant})),
                r(Col,{}, r(Draw_Tool,  {button_variant:button_variant})),
            )
        )
    )
}


function Draw_Tool(p){
    const draw_mode = useReactiveVar(draw_mode_var);
    const show_points = useReactiveVar(show_points_var);
    const mode_buttons = [
        {name:'Draw',   icon:'bi-plus-square-dotted', value:'draw'},
        {name:'Add',    icon:'bi-plus-square-dotted', value:'add'},
        {name:'Delete', icon:'bi-dash-square-dotted', value:'delete'},
    ];
    return(
        r(Row,{className:'row-cols-auto'},
            //r('p', {}, 'Vertex'),
            r(Col,{}, r(ButtonGroup, {}, //, role:'group', arialabel:'History' className: 'position-absolute'
                ...mode_buttons.map((button,i)=>
                    r(ToggleButton,{
                        id: 'draw_mode_'+i,
                        type: 'radio',
                        variant: p.button_variant,
                        value: button.value,
                        checked: draw_mode == button.value,
                        onChange:(e)=> draw_mode_var(e.currentTarget.value),
                    }, button.name)
                ),
            )),
            r(Col,{}, r(Form.Check, {
                className:'mt-2', 
                label:'Show Points', 
                checked:show_points, 
                onChange:(e)=> show_points_var(e.target.checked), 
            })),
        )
    )
}

// r(Button,{
                //     onClick:()=>editor_action({name:'add_points'}),    
                //     variant:p.button_variant,
                //     disabled: true,
                // }, r('i',{className:'bi-plus-square-dotted'}), ' Add'),
                // r(Button,{
                //     onClick:()=>editor_action({name:'delete_points'}), 
                //     variant:p.button_variant
                // }, r('i',{className:'bi-dash-square-dotted'}),  ' Delete'), //p.set_act({name:'undo'})

//r('div', {className: 'position-absolute start-0 end-0'},
           // r('div', {className: 'container-fluid pb-2 bg-body'}, //text-center