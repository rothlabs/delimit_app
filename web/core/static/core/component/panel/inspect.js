import {createElement as c, Fragment} from 'react';
import {Row, Col, ButtonToolbar, Button} from 'react-bootstrap';
import {ss, gs, useS, use_window_size} from '../../app.js';
import {Remake} from '../toolbar/remake.js';
import {Delete} from '../toolbar/delete.js';
import {Close} from '../toolbar/close.js';
import {Badge} from '../node/base.js'
//import {Cat_Badge} from '../../node/base.js'
import {String} from '../node/input/string.js';
import {Float} from '../node/input/float.js';


export function Inspect(){ 
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const nodes = useS(d=> d.pick.n); 
    const limited = useS(d=> d.pick.limited); 
    const cats = useS(d=> d.inspect.cats);
    const d = gs();
    return (
        show && (panel=='inspect_design' || panel=='inspect_nodes') && c(Fragment, {},
            c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
                ...nodes.map(n=>
                    c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
                        c(Badge, {n:n})
                    ) 
                ),
            ),
            limited ? null : c(ButtonToolbar, {className:'gap-2 mb-3'},
                c(Remake),
                c(Delete),
                c(Close),
            ),
            ...d.string_tags.map(t=>
                c(String, {t:t})
            ),
            ...d.float_tags.map(t=>
                c(Float, {t:t})
            ),
            !cats.length ? null : c(Fragment,{},
                c('h5',{className:'text-secondary bi-tag mt-4'}, ' Category'),
                c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
                    ...cats.map(t=>
                        c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
                            c(Button, {
                                id:'make_'+t,
                                className:'border-white pt-0 pb-1 px-2 '+d.node.meta[t].css,
                                variant:'outline-primary', 
                                onClick:e=> ss(d=>{ 
                                    d.pick.n.forEach(n=> d.delete.edge(d, d.cats[t], n)); 
                                }),
                            }, 
                                ' '+d.node.meta[t].tag
                            ) 
                        ) 
                    ),
                ),
            ),
        )
    )
}

// c(Cat_Badge, {t:t})

//const d = gs();
    //console.log('render inspector');


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


