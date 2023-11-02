import {createElement as c, Fragment} from 'react';
import {Row, Col, ButtonToolbar, Button} from 'react-bootstrap';
import {DragDropContext} from 'react-beautiful-dnd';
import {ss, gs, useS, use_window_size} from '../../app.js';
import {Visible} from '../toolbar/visible.js';
import {Remake} from '../toolbar/remake.js';
import {Apply} from '../toolbar/apply.js';
import {Delete} from '../toolbar/delete.js';
import {Close} from '../toolbar/close.js';
//import {Badge} from '../node/base.js'
//import {Cat_Badge} from '../../node/base.js'
import {Bool} from '../node/input/bool.js';
import {Integer} from '../node/input/integer.js';
import {Float} from '../node/input/float.js';
import {String} from '../node/input/string.js';
import {Source} from '../node/input/source.js';

//https://medium.com/nerd-for-tech/implement-drag-and-drop-between-multiple-lists-in-a-react-app-and-renders-web-content-in-a-react-d9378a49be3d

export function Inspect(){ 
    const panel = useS(d=> d.studio.panel.name);
    //const show = useS(d=> d.studio.panel.show);
    //const nodes = useS(d=> d.pick.n); 
    const limited = useS(d=> d.pick.limited); 
    ////////////////const cats = useS(d=> d.inspect.cats);
    const d = gs();
    const onDragEnd = result=>{
        const {source, destination} = result;
        ss(d=> d.pick.reorder_stem(d, 
            source.droppableId, 
            source.index, 
            destination.droppableId, 
            destination.index
        ));
    };
    return (
        //show && (panel=='inspect_design' || panel=='inspect_nodes') && 
        (panel=='inspect_design' || panel=='inspect_nodes') && c(Fragment, {},
            limited ? null : c(ButtonToolbar, {className:'gap-2 mb-3'},
                c(Visible),
                c(Remake),
                c(Delete),
                c(Close),
                c(Apply),
            ),
            d.string_tags.map(t=> c(String, {t})),
            d.boolean_tags.map(t=>   c(Bool, {t:t})),
            d.integer_tags.map(t=>    c(Integer, {t:t})),
            d.decimal_tags.map(t=>  c(Float, {t:t})),
            c(DragDropContext, {onDragEnd},
                d.stem_tags.map(t=> c(Source, {t:t})),
            ),
            // !cats.length ? null : c(Fragment,{},
            //     c('h5',{className:'text-secondary bi-tag mt-4'}, ' Tags'),
            //     c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
            //         ...cats.map(t=>
            //             c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
            //                 c(Button, {
            //                     id:'make_'+t,
            //                     className:'border-white pt-0 pb-1 px-2 '+d.node[t].css,
            //                     variant:'outline-primary', 
            //                     onClick:e=> ss(d=>{ 
            //                         d.pick.n.forEach(n=> d.delete.edge(d, d.cats[t], n)); 
            //                     }),
            //                 }, 
            //                     ' '+d.node[t].tag
            //                 ) 
            //             ) 
            //         ),
            //     ),
            // ),
        )
    )
}

// c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
            //     nodes.map(n=>
            //         c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
            //             c(Badge, {n:n})
            //         ) 
            //     ),
            // ),

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


