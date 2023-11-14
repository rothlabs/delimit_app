import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, Button, Badge} from 'react-bootstrap';

//import {Group} from './group.js';
import {useS, gs, ss, use_window_size} from '../../app.js';


export function Panel_Bar(){
    //const mode = useS(d=> d.studio.mode);
    // const design_candidate = useS(d=> d.design.candidate);
    const panel_mode = useS(d=> d.studio.panel.mode);
    const buttons = [
        {name:'Make',    icon:'bi-plus-square',    value:'make',    disabled:false},
        {name:'Inspect', icon:'bi-boxes',          value:'inspect', disabled:false},
        {name:'Package', icon:'bi-box-seam',       value:'package', disabled:false},
        {name:'Design',  icon:'bi-pencil-square',  value:'design',  disabled:false}, 
        {name:'Graph',   icon:'bi-diagram-3',      value:'graph',   disabled:false}, 
    ];
    //console.log('render panel bar');
    return(
        c(ButtonGroup, {
            vertical: true,
            //className:'gap-3 p-2',
        }, 
            buttons.map(button=>
                c(Button, {
                    className: button.icon + ' border-0',
                    type: 'radio',
                    variant: 'outline-primary', //size: 'lg',
                    disabled: button.disabled,
                    value: button.value,
                    checked: panel_mode == button.value,
                    onChange:e=> ss(d=>{
                        d.studio.panel.mode = e.currentTarget.value;
                        d.studio.panel.show = e.currentTarget.checked;
                    }),
                },
                    // button.name
                )
            )
        )
    
    )
}

