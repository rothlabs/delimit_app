import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Dropdown, Container, Form, ButtonGroup, ButtonToolbar, Button, ToggleButton} from 'react-bootstrap';
import {ss, gs, useS, use_window_size} from '../../../app.js';
import {Remake} from '../toolbar/remake.js';
import {Delete} from '../toolbar/delete.js';
import {Badge} from '../../node/base.js'
import {String} from '../../node/input/string.js';
import {Float} from '../../node/input/float.js';


export function Inspect(){ 
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const string_tags = useS(d=> d.string_tags);
    const float_tags = useS(d=> d.float_tags);
    const nodes = useS(d=> d.pick.nodes); 
    const d = gs();
    //console.log('render inspector');
    return (
        show && (panel=='inspect_design' || panel=='inspect_nodes') && c(Fragment, {},
            c(Row, {className:'row-cols-auto gap-2 mb-2 ms-1 me-4'}, //className:'ms-1 me-1'
                ...nodes.map(n=>
                    c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
                        c(Badge, {n:n})
                    ) 
                ),
            ),
            nodes.filter(n=>d.n[n].asset).length ? c(ButtonToolbar, {className:'gap-2 mb-2'},
                c(Delete),
                c(Remake),
            ) : null,
            ...string_tags.map(t=>
                c(String, {t:t})
            ),
            ...float_tags.map(t=>
                c(Float, {t:t})
            ),
        )
    )
}


// c(ButtonToolbar, {},
//     c(Button, {
//         variant: 'outline-secondary', size: 'lg',
//         className: 'border-white bi-trash2',
//         onClick:e=>ss(d=>{  // select function does not work inside produce because it has it's own produce 
//             d.pick.delete(d, true);
//         }),
//     }),
//     c(Button, {
//         variant: 'outline-secondary', size: 'lg',
//         className: 'border-white bi-trash2-fill',
//         onClick:e=>ss(d=>{  // select function does not work inside produce because it has it's own produce 
//             d.pick.delete(d);
//         }),
//     }),
// ),

                // c(Button, {
                //     variant: 'outline-secondary', size: 'lg',
                //     className: 'border-white bi-arrows-angle-contract',  //bi-sign-merge-left
                //     onClick:e=>ss(d=>{  // select function does not work inside produce because it has it's own produce 
                //         console.log('merge!!!');
                //     }),
                // }),


