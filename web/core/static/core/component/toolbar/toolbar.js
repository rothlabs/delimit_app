import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, ButtonToolbar, Button, Badge} from 'react-bootstrap';
import {History} from './history.js';
import {Draw} from './draw.js';
import {Pick} from './pick.js';
import {Move} from './move.js';

//import {useS, gs, ss, use_window_size} from '../../app.js';
//import { Badge } from '../../node/base.js';
//import {Panel} from '../panel/panel.js';

export function Toolbar(){
    //const mode = useS(d=> d.studio.mode);
    //const design_candidate = useS(d=> d.design.candidate);
    //const reckonable = useS(d=> d.pick.reckonable);
    const tools = [History, Pick, Draw, Move]; 
    //console.log('render toolbar', mode);
    return(
        c(ButtonToolbar, {className:''}, // gap-3 p-2 use ButtonToolbar here instead?
            ...tools.map(tool=> c(tool))
        )
        // c(Fragment,{}, //className: 'border-0
        //     c(Container, {fluid:true, className:'bg-white'}, // pb:5, ButtonToolbar
        //         c(ButtonToolbar,{className:'gap-3 p-2'}, // use ButtonToolbar here instead?
        //             ...tools.map(tool => c(tool))
        //         ),
        //     ),
        //     c('div', {className:'position-absolute bottom-0 start-50 translate-middle-x mb-3 d-grid gap-2 col-4 mx-auto'},
        //         mode=='graph' && design_candidate && c(Button, {
        //             size: 'lg', // variant: 'outline-primary',
        //             onClick:e=>ss(d=>{  // select function does not work inside produce because it has it's own produce 
        //                 d.design.part = design_candidate; 
        //                 d.studio.mode = 'design';
        //                 d.design.show(d);
        //                 //d.pick.none(d);
        //             }),
        //         }, c('i',{className:'bi-pencil-square', style:{fontSize:'24px'}}), ' Edit'),
        //         reckonable && c(Button, {
        //             size: 'lg', // variant: 'outline-primary',
        //             onClick:e=> ss(d=>{  // select function does not work inside produce because it has it's own produce 
        //                 d.pick.n.forEach(n=> {
        //                     if(d.n[n].c.autocalc == false) d.reckon.up(d, n, {manual:true}); 
        //                 });
        //             }),
        //         }, c('i',{className:'bi-cpu', style:{fontSize:'24px'}}), ' Compute'),
        //     ),
        //     c(Reckon_Count),
        // )
    )
}



//}, c('i',{className:button.icon, style:{fontSize:'24px'}}), window_size.width>576 ? button.name : '')

//className:'position-absolute bottom-0 start-50 translate-middle-x mb-2',


// c(Row,{className:'row-cols-auto gap-2 p-2'}, // use ButtonToolbar here instead?
                //     ...tools.map(tool => 
                //         c(Col,{className:'ps-1 pe-1'}, c(tool)),
                //     )
                // ),
