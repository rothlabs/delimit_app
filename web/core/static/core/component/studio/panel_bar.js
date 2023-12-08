import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, Button, Badge} from 'react-bootstrap';
import {use_store, set_store, draggable, icon} from 'delimit';


export function Panel_Bar(){
    //const mode = useS(d=> d.studio.mode);
    // const design_candidate = useS(d=> d.design.candidate);
    const panel_mode = use_store(d=> d.studio.panel.mode);
    const panel_mode_buttons = [
        {name:'Make',    icon:'bi-plus-square', value:'make',    disabled:false},
        {name:'Inspect', icon:'bi-menu-button', value:'inspect', disabled:false}, 
        {name:'Schema',  icon:'bi-ui-checks',   value:'schema',  disabled:false},
        {name:'Modules', icon:'bi-boxes',       value:'modules', disabled:false},
        {name:'Display', icon:'bi-eye',         value:'display', disabled:false}, 
    ];
    const panel_mode_drags = [
        {name:'Decimal', stem:{type:'xsd:decimal', value:0}},
        {name:'Integer', stem:{type:'xsd:integer', value:0}},
        {name:'String',  stem:{type:'xsd:string',  value:'new'}},
        {name:'Boolean', stem:{type:'xsd:boolean', value:true}},
    ];
    //console.log('render panel bar');
    return[
        ...panel_mode_buttons.map(({name, icon, disabled, value})=>
            c(ToggleButton, {
                id: 'panel_bar_'+name,
                className: 'border-0 rounded-end-pill ' + icon, // + (i==buttons.length-1 ? ' flex-grow-1' : ''),
                type: 'checkbox', 
                variant: 'outline-primary', size: 'lg',
                disabled,
                value,
                checked: panel_mode == value,
                onChange:e=> set_store(d=>{
                    if(panel_mode == value){
                        d.studio.panel.mode = '';
                    }else{
                        d.studio.panel.mode = value;
                    }
                }),
            })
        ),
        c('div', {className:'mb-auto'}),
        ...panel_mode_drags.map(({name, stem})=>
            c(ToggleButton, {
                id: 'leaf_bar_'+name,
                className: icon.css[stem.type] + ' border-0', 
                type: 'radio', // checkbox
                variant: 'outline-primary', size: 'lg',
                ...draggable({stem}),
            })
        ),
    ]
}

