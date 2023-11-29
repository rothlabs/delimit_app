import {createElement as c, Fragment, useState} from 'react';
import {Row, Col, ButtonToolbar, Button, Form, Accordion, InputGroup} from 'react-bootstrap';
import {DragDropContext} from 'react-beautiful-dnd';
import {use_store, get_store, set_store, Svg, readable} from 'delimit';

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
    use_store(d=> d.graph.change);
    const nodes = use_store(d=> [...d.picked.node]); //{shallow:true}
    //const d = get_store();
    // const header_color_list = (keys=[]) => {
    //     return nodes.map(n=> keys.includes(n) ? d.color.primary : d.color.body_fg);
    // }
    // const [header_color, set_header_color] = useState(header_color_list());
    //rs(d=> d.inspect.update(d));


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
        c(Accordion, {
            className:'ms-2 mt-2 me-1', 
            defaultActiveKey:['0'], 
            alwaysOpen:true,
            onSelect(keys){
                //set_header_color(header_color_list(keys));
            }
        },
            //nodes.map(root=> c(Node, {root, key:root})),
            nodes.map(root=> c(Root_Junction, {root, key:root})),
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

function Root_Junction({root, label}){
    const node_genre = use_store(d=> d.node_genre(d, root));
    if(node_genre == 'leaf') return c(Leaf, {root, term:'leaf', label}); 
    return c(Node, {root, label});
}

function Node({root, label}){
    const icon     = use_store(d=> d.face.icon(d, root));
    //const tag      = use_store(d=> d.face.tag(d, root));
    //const name     = use_store(d=> d.face.name(d, root));
    const title    = use_store(d=> d.face.title(d, root));
    const color    = use_store(d=> d.color.body_fg);
   // const root_obj = use_store(d=> d.node.get(root));
    const terms    = use_store(d=> [...d.node.get(root).forw.keys()]); //use_store(d=> [...d.forw(d, node)]);
    //const d = get_store();
    return(
        c(Accordion.Item, {
            eventKey: root,
            //className: 'border-0',
        },
            c(Accordion.Header, {className:'pe-2'}, 
                label  && c(InputGroup.Text, {}, readable(label)), // bg-body text-primary border-0    
                 
                //c(Svg, {svg:icon, color, className:'ms-2 me-2'}), //color:header_color[i] ?? d.color.body_fg
                c(InputGroup.Text, {className:'text-body'}, 
                    c(Svg, {svg:icon, color, className:'me-1'}),
                    readable(title),
                ), 
                //title, // name + ' ('+tag+')',
            ),
            c(Accordion.Body, {
                className:'ps-4', 
            }, 
                c(Accordion, {
                    defaultActiveKey:['0'], 
                    alwaysOpen:true,
                    onSelect(keys){
                        //set_header_color(header_color_list(keys));
                    }
                },
                    terms.map(term=> c(Term_Junction, {root, term, key:root+term})),
                ),
            ),
        )
    )
}

function Term_Junction({root, term}){
    const term_genre = use_store(d=> d.term_genre(d, root, term));
    if(term_genre.name == 'stem'){
        return c(Root_Junction, {root:term_genre.stem, label:term});
    //}else if(term_genre.name == 'stem_leaf'){
    //    return c(Leaf, {root:term_genre.stem, term:'leaf', label:term}) // indx:0,
    }else if(term_genre == 'leaf'){
        return c(Leaf, {root, term, label:term});
    }
    return c(Stems, {root, term});
}

function Stems({root, term}){
    const stems = use_store(d=> d.node.get(root).forw.get(term));
    const d = get_store();
    return(
        c(Accordion.Item, {
            eventKey: term,
            //className: 'border-0',
        },
            c(Accordion.Header, {className:'pe-2'}, 
                // need icon
                c(InputGroup.Text, {}, readable(term)),
                //c('div',{className:'text-primary'},readable(term)),
            ),
            c(Accordion.Body, {
                className:'ps-4', 
            }, 
                stems.map((stem, indx)=>{
                    const key = term + stem;
                    if(stem.type) return c(Leaf, {root, term, indx, key});
                    //if(d.node.has(stem)) return c(Node, {root:stem, key}); // should check if leaf_node !!!
                    if(d.node.has(stem)) return c(Root_Junction, {root:stem, key});
                }),
            ),
        )
    )
}

function Leaf({root, term, indx, label}){ // node_genre 
    //const node_genre = use_store(d=> d.node_genre(d, root));
    //const term_genre = use_store(d=> d.term_genre(d, root, term));
    if(term == 'leaf' || label) indx = 0;
    const leaf = use_store(d=> d.node.get(root).forw.get(term)[indx]);
    return(
        c(InputGroup, {}, //className:'mb-2' 
            label  && c(InputGroup.Text, {}, readable(label)), // bg-body text-primary border-0
            term=='leaf' && c(InputGroup.Text, {className:'bi-box text-body'}, ''),
            leaf.type == 'xsd:boolean'
                ? c(Form.Check, {
                    className:'flex-grow-1 ms-2 mt-2', //4 mt-2 me-4 
                    //style: {transform:'scale(1.8);'},
                    type:     'switch',
                    //label:    readable(t), 
                    //disabled: !asset, 
                    checked: leaf.value, 
                    onChange(e){
                        set_store(d=> d.mutate.leaf(d, root, term, indx, e.target.checked));
                    }, 
                })
                : c(Form.Control, {
                    ///////// as:area_tags.includes(t) ? 'textarea' : 'input', 
                    ///////// maxLength:64,
                    ///////// placeholder:placeholder,  
                    ///////// disabled:!asset, 
                    value: leaf.value, 
                    onChange(e){
                        set_store(d=> d.mutate.leaf(d, root, term, indx, e.target.value));
                    }, 
                })
            ///c(Buttons, {t:t}),
        )
    )
}

// // ? c(Boolean_Input, {root, term, indx, leaf}) 
// //                 : c(String_Input, {root, term, indx, leaf}),

// function Boolean_Input({root, term, indx, leaf}){
//     return(
//         c(Form.Check, {
//             className:'flex-grow-1 ms-2 mt-2', //4 mt-2 me-4 
//             //style: {transform:'scale(1.8);'},
//             type:     'switch',
//             //label:    readable(t), 
//             //disabled: !asset, 
//             checked: leaf.value, 
//             onChange(e){
//                 set_store(d=> d.mutate.leaf(d, root, term, indx, e.target.checked));
//             }, 
//         })
//     )
// }

// function String_Input({root, term, indx, leaf}){
//     return(
//         c(Form.Control, {
//             ///////// as:area_tags.includes(t) ? 'textarea' : 'input', 
//             ///////// maxLength:64,
//             ///////// placeholder:placeholder,  
//             ///////// disabled:!asset, 
//             value: leaf.value, 
//             onChange(e){
//                 set_store(d=> d.mutate.leaf(d, root, term, indx, e.target.value));
//             }, 
//         })
//     )
// }



// import {Visible} from '../toolbar/visible.js';
// import {Remake} from '../toolbar/remake.js';
// import {Apply} from '../toolbar/apply.js';
// import {Delete} from '../toolbar/delete.js';
// import {Close} from '../toolbar/close.js';
// //import {Badge} from '../node/base.js'
// //import {Cat_Badge} from '../../node/base.js'
// import {Boolean} from '../node/input/boolean.js';
// import {Integer} from '../node/input/integer.js';
// import {Decimal} from '../node/input/decimal.js';
// import {String} from '../node/input/string.js';
// import {Stem} from '../node/input/stem.js';





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


