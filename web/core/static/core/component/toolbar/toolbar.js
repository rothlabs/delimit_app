import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, ButtonToolbar, Button, Badge} from 'react-bootstrap';
import {Inspect} from './inspect.js';
import {History} from './history.js';
import {Draw} from './draw.js';
import {Visual} from './visual.js';
import {Pick} from './pick.js';
import {Make} from './make.js';
import {Move} from './move.js';
//import {Group} from './group.js';
import {useS, gs, ss, use_window_size} from '../../app.js';
//import { Badge } from '../../node/base.js';
//import {Panel} from '../panel/panel.js';

export function Toolbar(){
    const window_size = use_window_size();
    const mode = useS(d=> d.studio.mode);
    const design_part = useS(d=> d.design.part);
    const design_candidate = useS(d=> d.design.candidate);
    const reckonable = useS(d=> d.pick.reckonable);
    const mode_buttons = [
        {name:' Design',  icon:'bi-pencil-square',  value:'design', disabled:design_part==null},
        {name:' Graph',   icon:'bi-diagram-3',      value:'graph',  disabled:false},
    ];
    const tools = [Make, Inspect, History, Visual, Pick, Draw, Move]; //Group
    return(
        c(Fragment,{},
            c(ButtonGroup, {className:'position-absolute top-0 start-50 translate-middle-x mt-3', style:{zIndex: 1}}, 
                ...mode_buttons.map((button,i)=>
                    c(ToggleButton,{
                        id: 'studio_mode'+i,
                        type: 'radio',
                        variant: 'outline-primary', size: 'lg',
                        value: button.value,
                        checked: mode == button.value,
                        onChange:e=> ss(d=>{
                            d.studio.mode=e.currentTarget.value
                            if(d.studio.mode=='design') d.design.show(d); // should this be in NEXT statement ?!?!?!?!?!
                            d.next('design.update'); 
                        }),
                        disabled: button.disabled,
                        className: button.icon,
                    }, c('span',{style:{fontSize:'18px'}}, window_size.width>576 ? button.name : '')) //c('span',{className:'align-baseline'},button.name)
                ),
            ),
            c(Container, {fluid:true, className:'bg-white'}, // pb:5, ButtonToolbar
                c(ButtonToolbar,{className:'gap-3 p-2'}, // use ButtonToolbar here instead?
                    ...tools.map(tool => c(tool))
                ),
            ),
            c('div', {className:'position-absolute bottom-0 start-50 translate-middle-x mb-3 d-grid gap-2 col-4 mx-auto'},
                mode=='graph' && design_candidate && c(Button, {
                    size: 'lg', // variant: 'outline-primary',
                    onClick:e=>ss(d=>{  // select function does not work inside produce because it has it's own produce 
                        d.design.part = design_candidate; 
                        d.studio.mode = 'design';
                        d.design.show(d);
                        d.pick.none(d);
                    }),
                }, c('i',{className:'bi-pencil-square', style:{fontSize:'24px'}}), ' Edit'),
                reckonable && c(Button, {
                    size: 'lg', // variant: 'outline-primary',
                    onClick:e=> ss(d=>{  // select function does not work inside produce because it has it's own produce 
                        d.pick.n.forEach(n=> {
                            if(d.n[n].c.manual_compute) d.reckon.up(d, n, 'manual_compute'); 
                        });
                    }),
                }, c('i',{className:'bi-cpu', style:{fontSize:'24px'}}), ' Compute'),
            ),
            c(Reckon_Count),
        )
    )
}

function Reckon_Count(){
    const reckon_count = useS(d=> d.reckon.count);
    return c(Badge, {className:'position-absolute bottom-0 start-0 m-1'}, 'Reckons: '+reckon_count);
}

//}, c('i',{className:button.icon, style:{fontSize:'24px'}}), window_size.width>576 ? button.name : '')

//className:'position-absolute bottom-0 start-50 translate-middle-x mb-2',


// c(Row,{className:'row-cols-auto gap-2 p-2'}, // use ButtonToolbar here instead?
                //     ...tools.map(tool => 
                //         c(Col,{className:'ps-1 pe-1'}, c(tool)),
                //     )
                // ),
