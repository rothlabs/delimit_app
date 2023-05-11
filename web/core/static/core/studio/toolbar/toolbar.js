import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, Button} from 'boot';
import {Inspect} from './inspect.js';
import {History} from './history.js';
import {Tool} from './tool.js';
import {Visual} from './visual.js';
import {Select} from './select.js';
import {Make} from './make.js';
import {useS, ss, use_window_size} from '../../app.js';


export function Toolbar(){
    const window_size = use_window_size();
    const mode = useS(d=> d.studio.mode);
    const design_part = useS(d=> d.design.part);
    const design_candidate = useS(d=> d.design.candidate);
    const mode_buttons = [
        {name:' Design',  icon:'bi-pencil-square',  value:'design', disabled:design_part==null},
        {name:' Graph',   icon:'bi-diagram-3',      value:'graph',  disabled:false},
    ];
    const tools = [Make, Inspect, Visual, History, Select, Tool];
    return(
        c(Fragment,{},
            c(ButtonGroup, {className:'position-absolute top-0 start-50 translate-middle-x mt-2', style:{zIndex: 1}}, 
                ...mode_buttons.map((button,i)=>
                    c(ToggleButton,{
                        id: 'studio_mode'+i,
                        type: 'radio',
                        variant: 'outline-primary', size: 'lg',
                        value: button.value,
                        checked: mode == button.value,
                        onChange:e=> ss(d=> d.studio.mode=e.currentTarget.value),
                        disabled: button.disabled,
                        //className: button.icon,
                    }, c('i',{className:button.icon, style:{fontSize:'24px'}}), window_size.width>576 ? button.name : '') //c('span',{className:'align-baseline'},button.name)
                ),
            ),
            c(Container, {fluid:true, className:'bg-white pt-2 pb-2'}, // pb:5,
                c(Row,{className:'row-cols-auto gap-2'}, // use ButtonToolbar here instead?
                    ...tools.map(tool => 
                        c(Col,{}, c(tool)),
                    )
                )
            ),
            mode=='graph' && design_candidate && c('div', {className:'position-absolute bottom-0 start-50 translate-middle-x mb-2 d-grid gap-2 col-6 mx-auto'},
                c(Button, {
                    size: 'lg', // variant: 'outline-primary',
                    onClick:e=>ss(d=>{  // select function does not work inside produce because it has it's own produce 
                        d.design.part = design_candidate;
                        d.studio.mode = 'design'; 
                        d.n[d.design.part].picked = false; // need to make select function for inside set function?
                        d.pick.update(d);
                    }),
                }, c('i',{className:'bi-pencil-square', style:{fontSize:'24px'}}), ' Edit'),
            )
        )
    )
}

//className:'position-absolute bottom-0 start-50 translate-middle-x mb-2',

