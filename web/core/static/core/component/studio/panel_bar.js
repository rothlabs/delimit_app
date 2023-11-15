import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, Button, Badge} from 'react-bootstrap';

//import {Group} from './group.js';
import {useS, gs, ss, rs, use_window_size} from '../../app.js';


export function Panel_Bar(){
    //const mode = useS(d=> d.studio.mode);
    // const design_candidate = useS(d=> d.design.candidate);
    const panel_mode = useS(d=> d.studio.panel.mode);
    const buttons = [
        {name:'Make',    icon:'bi-plus-square', value:'make',    disabled:false},
        {name:'Inspect', icon:'bi-file-ruled',  value:'inspect', disabled:false}, 
        {name:'Modules', icon:'bi-boxes',       value:'modules', disabled:false},
        {name:'Display', icon:'bi-eye',         value:'display', disabled:false}, 
    ];
    //console.log('render panel bar');
    return buttons.map((button, i)=>
        c(ToggleButton, {
            id: 'panel_bar_'+i,
            className: 'border-0 ' + button.icon, // + (i==buttons.length-1 ? ' flex-grow-1' : ''),
            type: 'checkbox',
            variant: 'outline-primary', size: 'lg',
            disabled: button.disabled,
            value: button.value,
            checked: panel_mode == button.value,
            onChange:e=> rs(d=>{
                if(panel_mode == button.value){
                    d.studio.panel.mode = '';
                }else{
                    d.studio.panel.mode = button.value;
                }
            }),
        })
    );
    
}

