import {createElement as c, useEffect, useRef, useState} from 'react';
import {Row, Col, ButtonToolbar, Button, Form, Accordion, InputGroup} from 'react-bootstrap';
import {use_store, set_store, get_store, commit_store, Svg, 
    readable, draggable, droppable, pickable, Icon_Title, icon} from 'delimit';
import {animated, useSpring, useTransition} from '@react-spring/web';
import classNames from 'classnames';

function div_height(ref){
    return (ref.current?.offsetHeight ? ref.current.offsetHeight : 0);
}

const transition_config = {
    from:  {o: 1, marginLeft:'-100%', opacity:0, transform: 'scaleY(0%)'},
    enter: {o: 0, marginLeft:'0%',    opacity:1, transform: 'scaleY(100%)'},
    leave: {o: 1, marginLeft:'-100%', opacity:0, transform: 'scaleY(0%)'},
    config: { tension: 210, friction: 20, mass: 0.5 },
};

export function Inspect(){ 
    const nodes = use_store(d=> [...d.picked.primary.node]); 
    return(
        c('div', { 
            style: {maxHeight: '90vh'}, //overflow:'auto'
        },
            nodes.map(node=> c(Node_Joint, {node, key:node, path:node})),
        )
    )
}

function Node_Joint({root, term, node, index, show_term, path}){
    const node_joint = use_store(d=> d.node_joint(d, node));
    //if(!node_joint) return;
    if(node_joint.name == 'leaf'){
        return c(Leaf, {root:node, term, ...node_joint.leaf, show_term:true, show_icon:term}); 
    }else if(node_joint == 'missing'){
        return(
            c(InputGroup, {
                ...droppable({root, term, index}), 
                ...draggable({root, term, stem:node, index})
            }, 
                show_term && c(InputGroup.Text, {}, readable(term)), 
                c(Icon_Title, {node}),
            )
        )
    }
    return c(Node, {root, term, node, index, show_term, path});
}

function Node({root, term, node, index=0, show_term, path}){
    path = path + term + node + index;
    const stem_div = useRef();
    const open  = use_store(d=> d.inspected.has(path));
    //const color = use_store(d=> d.face.color.primary(d, node));
    //const picked = use_store(d=> d.picked.primary.node.has(node) || d.picked.secondary.node.has(node));
    const primary_pick = use_store(d=> d.picked.primary.node.has(node));
    const secondary_pick = use_store(d=> d.picked.secondary.node.has(node));
    const terms = use_store(d=> [...d.node.get(node).forw.keys()]); 
    const transitions = useTransition(open, transition_config);
    const arrow_css = classNames(
        'h5 me-2 text-info position-absolute top-50 end-0 translate-middle-y', 
        (open ? icon.css.chevron_down : icon.css.chevron_left),
    );
    if(!terms.length){
        return(
            c(InputGroup, {
                ...droppable({root, term, index}),
                ...draggable({root, term, stem:node, index}),
                ...pickable({node, mode:'secondary'}),
            },
                show_term && c(InputGroup.Text, {className:'user-select-none'}, readable(term)),
                c(Icon_Title, {node}), 
            )
        )
    }
    return[
        c(InputGroup, {
            style: {
                borderLeft:  (primary_pick ?   ('thick solid var(--bs-primary)')   : 'none'),
                borderRight: (secondary_pick ? ('thick solid var(--bs-secondary)') : 'none'),
            },
            role: 'button',
            ...droppable({root, term, index}), 
            ...draggable({root, term, stem:node, index}),
            ...pickable({node, mode:'secondary'}),
            onClick(e){
                set_store(d=>{
                    d.inspect.toggle(d, {path});
                });
            },
        },
            show_term && c(InputGroup.Text, {className:'user-select-none'}, readable(term)), 
            c(Icon_Title, {node}),
            c('div', {className:'me-4'}),
            c('div', {className:arrow_css, style:{zIndex:10}}),
        ),
        c('div', {ref:stem_div, className:'ms-4'},
            transitions((style, open)=> 
                open && c(animated.div, {style:{...style, marginTop: style.o.to(v=> -div_height(stem_div) * v)}}, 
                    terms.map(term=> c(Term_Joint, {root:node, term, key:term, path})),
                )
            )
        ),
    ]
}

function Term_Joint({root, term, path}){
    const term_joint = use_store(d=> d.term_joint(d, root, term));
    if(!term_joint) return;
    if(term_joint == 'empty'){
        return(
            c(InputGroup, {
                ...droppable({root, term}),
                ...draggable({root, term}),
            },
                c(InputGroup.Text, {className:'user-select-none'}, readable(term)),
                c(InputGroup.Text, {className:'user-select-none text-body'}, 'emtpy'), 
            )
        )
    }else if(term_joint.name == 'node'){
        return c(Node_Joint, {root, term, node:term_joint.node, show_term:true, path});
    }else if(term_joint.name == 'leaf'){
        return c(Leaf, {root, term, ...term_joint.leaf, show_term:true});
    }
    return c(Term, {root, term, path});
}

function Term({root, term, path}){
    const stem_div = useRef();
    const pth = path + term;
    const open = use_store(d=> d.inspected.has(pth));
    const stems = use_store(d=> d.node.get(root).forw.get(term));
    const transitions = useTransition(open, transition_config);
    return[
        c(InputGroup, {
            role: 'button',
            ...droppable({root, term}), 
            onClick(e){
                set_store(d=> d.inspect.toggle(d, {path:pth}));
            },
        },
            c(InputGroup.Text, {}, readable(term)),
        ),
        c('div', {ref:stem_div, className:'ms-4'},
            transitions((style, open)=> 
                open && c(animated.div, {style:{...style, marginTop: style.o.to(v=> -div_height(stem_div) * v)}}, 
                    stems.map((stem, index)=>{
                        if(stem.type) return c(Leaf, {root, term, ...stem, index, key:index});
                        return c(Node_Joint, {root, term, node:stem, index, key:index, path});
                    }),
                )
            )
        ),
    ]
}

function Leaf({root, term='leaf', type, value, index=0, show_term, show_icon}){ // ...droppable({node, term})
    const [input_value, set_input_value] = useState(value);
    const [sync_input, set_sync_input] = useState(true);
    useEffect(()=>{
        if(sync_input) set_input_value(value);
    },[value]);
    const drag = draggable({root, term, stem:{type, value}, index});
    const drop = droppable({root, term, index});
    const icon_css = classNames(
        'h5 me-2 text-info position-absolute top-50 end-0 translate-middle-y', 
        icon.css[type],
    );
    return(
        c('div', {className:'position-relative', tabIndex:0},
            c(InputGroup, {//className:'rounded-pill',
                ...drop,
                tabIndex:1,
            }, //className:'mb-2' 
                show_term && c(InputGroup.Text, {...drag, className:'user-select-none'}, readable(term)), // bg-body text-primary border-0
                show_icon && c(InputGroup.Text, {...drag, className:icon.css.generic+' text-body'}, ''),
                //!show_term && !show_icon && c(InputGroup.Text, {...drag, className:'bi-grip-vertical'}),
                type == 'xsd:boolean' ?
                    c(Form.Check, {
                        className:'flex-grow-1 ms-2 mt-2 shadow-none', //4 mt-2 me-4 
                        //style: {transform:'scale(1.8);'},
                        type:     'switch',
                        //label:    readable(t), 
                        //disabled: !asset, 
                        checked: value, 
                        onChange(e){
                            commit_store(d=> d.mutate.leaf(d, root, term, index, e.target.checked));
                        }, 
                        ...drag,
                    }) : 
                    c(Form.Control, {
                        //className:'rounded-pill',
                        ///////// as:area_tags.includes(t) ? 'textarea' : 'input', 
                        ///////// maxLength:64,
                        ///////// placeholder:placeholder,  
                        ///////// disabled:!asset, 
                        value: input_value, 
                        onFocus: ()=> set_sync_input(false),
                        onBlur(e){
                            set_sync_input(true);
                            if(type != 'xsd:string'){
                                if(value == '') value = '0';
                                set_input_value(''+parseFloat(value));
                            }
                        },
                        onChange(e){
                            commit_store(d=>{
                                const coerced = d.mutate.leaf(d, root, term, index, e.target.value);
                                if(coerced != null) set_input_value(coerced); 
                            });
                        }, 
                    }),
            ),
            c('div', {className:icon_css, ...drag, ...drop, style:{zIndex:10}}),
        )
    )
}


// c('div', {ref:stem_div},
//             (open || vis) && c(animated.div, {style:{...springs}}, //  overflow-hidden className:'ms-4', 
            
//                 //c('div', {},
//                     terms.map(term=> c(Term_Joint, {root:node, term, key:term, path})),
//                 //),
//             ),
//         ),

// c(Accordion.Item, {eventKey}, 
//     c(Accordion.Header, {
//         className:'pe-2',
//         ...droppable({root, term, index}),
//         ...draggable({root, term, stem:node, index}),
//     },  
//         show_term && c(InputGroup.Text, {className:'user-select-none'}, readable(term)), 
//         c(Icon_Title, {node}),
//     ),
//     c(Accordion.Body, {className:'ps-4'}, 
//         terms.map(term=> c(Term_Joint, {root:node, term, key:term})),
//     ),
// )

// c(Accordion, { 
//     //className: 'ms-2 mt-2 me-1', 
//     key: nodes[0],
//     defaultActiveKey: [nodes[0]+0], 
//     alwaysOpen: true,
//     //onSelect(open_keys){},
// },
//     nodes.map(node=> c(Node_Joint, {node, key:node})),
// )


// c(Accordion.Item, {eventKey:root+term},
//     c(Accordion.Header, {
//         className:'pe-2',
//         ...droppable({root, term}),
//     }, 
//         c(InputGroup.Text, {}, readable(term)),
//     ),
//     c(Accordion.Body, {className:'ps-4'}, 
//         stems.map((stem, index)=>{
//             if(stem.type) return c(Leaf, {root, term, ...stem, index, key:index});
//             return c(Node_Joint, {root, term, node:stem, index, key:index, path});
//         }),
//     ),
// )


// merge picked nodes
// split for all roots
// merge, edit, drop buttons for stem in tree that have same term path from one of the picked nodes  
// icon term edit pick_nodes_under_this_term drop (alphabetical)
    // icon stem pick drop  (node, leaf, or node-with-leaf-edit-box)
        // icon term edit drop
// if first level is grouped, second level still will not be grouped
// const onDragEnd = ({source, destination}) => {
//     console.log(source, destination);
//     //const {source, destination} = result;
//     // set_store(d=> d.reorder(d, 
//     //     source.droppableId,      // term
//     //     source.index,          
//     //     destination.droppableId, // term 
//     //     destination.index
//     // ));
// };


    // const icon_css = classNames('h5 me-2 text-primary position-absolute top-50 end-0 translate-middle-y', { 
    //     'bi-123':  type == 'xsd:integer', // bi-0-square
    //     'bi-hash': type == 'xsd:decimal', // bi-0-circle
    //     'bi-type': type == 'xsd:string',
    // });

                    // draggable:"true",
                    // onDrag(e){
                    //     console.log('dragging on leaf');
                    //     e.stopPropagation();
                    //     e.preventDefault();
                    // },
                    // onDragOver(e){
                    //     console.log('dragging on leaf');
                    //     e.stopPropagation();
                    //     e.preventDefault();
                    // },
                    // onDragEnter(e){
                    //     console.log('dragging on leaf');
                    //     e.stopPropagation();
                    //     e.preventDefault();
                    // },
                    // onDragStart(e){
                    //     console.log('dragging on leaf');
                    //     e.stopPropagation();
                    //     e.preventDefault();
                    // },

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


