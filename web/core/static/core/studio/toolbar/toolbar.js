import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup} from 'boot';
import {Inspect} from './inspect.js';
import {History} from './history.js';
import {Tool} from './tool.js';
import {Visual} from './visual.js';
import {Select} from './select.js';
import {useD, use_window_size} from '../../app.js';


export function Toolbar(){
    const window_size = use_window_size();
    const mode = useD(d=> d.studio.mode);
    const mode_buttons = [
        {name:' Design',  icon:'bi-pencil-square',  value:'design'},
        {name:' Graph',   icon:'bi-diagram-3',      value:'graph'},
    ];
    const tools = [Inspect, Visual, History, Select, Tool];
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
                            onChange:e=> useD.getState().set(d=>{ d.studio.mode=e.currentTarget.value}),
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
            )
        )
    )
}

