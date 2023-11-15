import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, ButtonToolbar, Button, Badge} from 'react-bootstrap';
import {useS, gs, ss, use_window_size} from '../../app.js';

export function Mode_Bar(){
    const window_size = use_window_size();
    const studio_mode = useS(d=> d.studio.mode);
    //const design_part = useS(d=> d.design.part);
    const mode_buttons = [
        {name:' Package', icon:'bi-box-seam',       value:'package', disabled:false},
        {name:' Design',  icon:'bi-pencil-square',  value:'design',  disabled:false}, // design_part==null
        {name:' Graph',   icon:'bi-diagram-3',      value:'graph',   disabled:false},
        {name:' Code',    icon:'bi-braces',         value:'code',    disabled:false},
    ];
    //console.log('render mode bar', mode);
    return(
        // c(ButtonGroup, {
        //     className:'position-absolute top-0 start-50 translate-middle-x mt-2', 
        //     style:{zIndex: 1}
        // }, 
            mode_buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'studio_mode'+i,
                    className: button.icon + ' border-0',
                    type: 'radio',
                    variant: 'outline-primary', //size: 'lg',
                    value: button.value,
                    checked: studio_mode == button.value,
                    onChange:e=> ss(d=>{
                        d.studio.mode = e.currentTarget.value
                        if(d.studio.mode == 'design'){
                            d.design.show(d); // should this be in NEXT statement ?!?!?!?!?!
                            d.next('design.update'); 
                        }
                    }),
                    disabled: button.disabled,
                }, 
                    window_size.width>576 ? button.name : '',
                )
            )
        //)
    )
}

//}, c('span',{style:{fontSize:'18px'}}, window_size.width>576 ? button.name : '')) //c('span',{className:'align-baseline'},button.name)