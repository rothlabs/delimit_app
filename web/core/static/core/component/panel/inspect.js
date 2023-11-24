import {createElement as c, Fragment} from 'react';
import {Row, Col, ButtonToolbar, Button, Accordion} from 'react-bootstrap';
import {DragDropContext} from 'react-beautiful-dnd';
import {ss, gs, useS, useSS, use_window_size} from '../../app.js';
import {Visible} from '../toolbar/visible.js';
import {Remake} from '../toolbar/remake.js';
import {Apply} from '../toolbar/apply.js';
import {Delete} from '../toolbar/delete.js';
import {Close} from '../toolbar/close.js';
//import {Badge} from '../node/base.js'
//import {Cat_Badge} from '../../node/base.js'
import {Boolean} from '../node/input/boolean.js';
import {Integer} from '../node/input/integer.js';
import {Decimal} from '../node/input/decimal.js';
import {String} from '../node/input/string.js';
import {Stem} from '../node/input/stem.js';

//https://medium.com/nerd-for-tech/implement-drag-and-drop-between-multiple-lists-in-a-react-app-and-renders-web-content-in-a-react-d9378a49be3d

// Vector
    // X
        // 5.0  make_leaf_node


// merge picked nodes
// split for all roots

// merge, edit, drop buttons for stem in tree that have same term path from one of the picked nodes  


// icon term edit pick_nodes_under_this_term drop (alphabetical)
    // icon stem pick drop  (node, leaf, or node-with-leaf-edit-box)
        // icon term edit drop

// if first level is grouped, second level still will not be grouped

export function Inspect(){ 
    useS(d=> d.graph.change);
    const nodes = useSS(d=> [...d.picked.node]);
    //rs(d=> d.inspect.update(d));

    const d = gs();
    // const onDragEnd = result=>{
    //     const {source, destination} = result;
    //     ss(d=> d.reorder.stem(d, 
    //         source.droppableId, 
    //         source.index, 
    //         destination.droppableId, 
    //         destination.index
    //     ));
    // };
    return(
        c(Accordion, {className:'ms-2 mt-2', defaultActiveKey:['0'], alwaysOpen:true},
            nodes.map((node,i)=>
                c(Accordion.Item, {eventKey:i},
                    c(Accordion.Header, {}, d.face.name(d, node) + '('+d.face.tag(d, node)+')'),
                    c(Accordion.Body, {}, `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                    minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.`),
                )
            )
        )
            // c(ButtonToolbar, {className:'gap-2 mb-3'},
            //     c(Visible),
            //     c(Remake),
            //     c(Delete),
            //     c(Close),
            //     c(Apply),
            // ),
            // [...d.string_tags,  'string'].map(t=>  c(String,  {t})),
            // [...d.boolean_tags, 'boolean'].map(t=> c(Boolean, {t})),
            // [...d.integer_tags, 'integer'].map(t=> c(Integer, {t})),
            // [...d.decimal_tags, 'decimal'].map(t=> c(Decimal, {t})),
            // c(DragDropContext, {onDragEnd},
            //     d.stem_tags.map(t=> c(Stem, {t:t})),
            // ),
    )
}







// export function Inspect(){ 
//     const panel = useS(d=> d.studio.panel.mode);
//     //const show = useS(d=> d.studio.panel.show);
//     //const nodes = useS(d=> d.pick.n); 
//     const limited = useS(d=> d.pick.limited); 
//     ////////////////const cats = useS(d=> d.inspect.cats);
//     const d = gs();
//     const onDragEnd = result=>{
//         const {source, destination} = result;
//         ss(d=> d.pick.reorder_stem(d, 
//             source.droppableId, 
//             source.index, 
//             destination.droppableId, 
//             destination.index
//         ));
//     };
//     return (
//         //show && (panel=='inspect_design' || panel=='inspect_nodes') && 
//         (panel=='inspect_design' || panel=='inspect_nodes') && c(Fragment, {},
//             limited ? null : c(ButtonToolbar, {className:'gap-2 mb-3'},
//                 c(Visible),
//                 c(Remake),
//                 c(Delete),
//                 c(Close),
//                 c(Apply),
//             ),
//             [...d.string_tags,  'string'].map(t=>  c(String,  {t})),
//             [...d.boolean_tags, 'boolean'].map(t=> c(Boolean, {t})),
//             [...d.integer_tags, 'integer'].map(t=> c(Integer, {t})),
//             [...d.decimal_tags, 'decimal'].map(t=> c(Decimal, {t})),
//             c(DragDropContext, {onDragEnd},
//                 d.stem_tags.map(t=> c(Stem, {t:t})),
//             ),
//             // !cats.length ? null : c(Fragment,{},
//             //     c('h5',{className:'text-secondary bi-tag mt-4'}, ' Tags'),
//             //     c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
//             //         ...cats.map(t=>
//             //             c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
//             //                 c(Button, {
//             //                     id:'make_'+t,
//             //                     className:'border-white pt-0 pb-1 px-2 '+d.node[t].css,
//             //                     variant:'outline-primary', 
//             //                     onClick:e=> ss(d=>{ 
//             //                         d.pick.n.forEach(n=> d.delete.edge(d, d.cats[t], n)); 
//             //                     }),
//             //                 }, 
//             //                     ' '+d.node[t].tag
//             //                 ) 
//             //             ) 
//             //         ),
//             //     ),
//             // ),
//         )
//     )
// }







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


