import {createElement as c, useState} from 'react';
import {Row, Col, ButtonToolbar, Button, Form, Accordion, InputGroup} from 'react-bootstrap';
import {use_store, set_store, get_store, Svg, Svg_Button} from 'delimit';
//import { Make_Repo } from './make_repo.js';
//import {Badge} from '../node/base.js'

//import { ReactComponent as PublicIcon } from '../../../icon/node/public.svg';

export function Make_Node(){
    const contexts = use_store(d=> d.stems(d, d.entry, 'app contexts')); 
    return(
        c(Accordion, { // onSelect(keys){}
            className:'ms-2 mt-2 me-1', 
            key: contexts[0],
            defaultActiveKey: [contexts[0]], 
            alwaysOpen:true,
        },
            contexts.map(root=> c(Context, {root})),
        )
    )
}

function Context({root}){
    const icon  = use_store(d=> d.face.icon(d, root));
    const title = use_store(d=> d.face.title(d, root));
    const types = use_store(d=> d.stems(d, root, 'types')); 
    return(
        c(Accordion.Item, {eventKey:root},
            c(Accordion.Header, {className:'pe-2'}, 
                c(InputGroup.Text, {className:'text-body'}, 
                    c(Svg, {svg:icon, className:'me-1'}), 
                    title,
                ), 
            ),
            c(Accordion.Body, {className:'ps-4'}, 
                c('div', {className:'d-grid'},
                    types.map(type=> c(Root_Type, {type, key:type})),
                )
            ),
        )
    )
}

function Root_Type({type}){
    const icon = use_store(d=> d.value(d, type, 'icon code', d.face.alt.icon));
    const name = use_store(d=> d.value(d, type, 'name', 'Node'));
    return(
        c(Svg_Button, {
            //className:'w-100',
            svg:  icon, 
            text: name, 
            func:e=> set_store(d=>{ 
                d.make.node(d, {type});  //[...d.picked.node][0]
            })
        })
    )
}



//d.first(d, d.picked.node)





// const mode = useS(d=> d.studio.mode);
// const panel = useS(d=> d.studio.panel.mode);
// if(panel != 'make') return false;
// if(mode == 'repo') return c(Make_Repo);
// const limited = useS(d=> d.pick.limited); 
// const terminal = useS(d=> d.pick.terminal); 



//if(d.terminal_classes[t]){
                        //    d.make.atom(d, t, null, {r:d.pick.n, t:t, single:true});
                        //}else{
                        //    d.make.part(d, t, {r:d.pick.n});
                        //}
                        //d.studio.panel.show = false;


// c(Row, {}, // className:'mb-3 ms-0 me-0'
//             c(Col, {}, 
//                 c('h5',{className:'text-secondary bi-diagram-3'}, ' Node'),
//                 ...Object.keys(d.node).map((t,i)=>//...d.asset_classes.map((t,i)=>//...Object.entries(d.node.meta).map(([t,node])=>
//                     c(Row, {className: 'mt-1 text-left '+(i==Object.keys(d.node).length-1?'mb-4':'')},
//                         c(Svg_Button, {
//                             svg: d.spec.icon(d,n),
//                             text: readable(t), 
//                             func: ()=> set_store(d=>{ 
//                                 d.make.part(d, t, {r:d.pick.n});
//                                 //if(d.terminal_classes[t]){
//                                 //    d.make.atom(d, t, null, {r:d.pick.n, t:t, single:true});
//                                 //}else{
//                                 //    d.make.part(d, t, {r:d.pick.n});
//                                 //}
//                                 //d.studio.panel.show = false;
//                             })
//                         })
//                     )
//                 ),
//             ),
//             limited || terminal ? false : c(Col, {}, 
//                 [{cls:'string',  v:'',    tags:d.string_tags,  icon:'bi-text-left'},
//                     {cls:'boolean', v:false, tags:d.boolean_tags, icon:'bi-ui-checks'},
//                     {cls:'integer', v:0,     tags:d.integer_tags, icon:'bi-plus-slash-minus'},
//                     {cls:'decimal', v:0,     tags:d.decimal_tags, icon:'bi-plus-slash-minus'}].map(item=>
//                     c(Row, {},
//                         c('h5',{className:'text-secondary '+item.icon}, ' '+readable(item.cls)),//+readable(d.model_tags[item.m])),
//                         item.tags.map((t,i)=>
//                             c(Row, {className: 'mb-1 text-left '+(i==item.tags.length-1?'mb-4':'')}, //t==item.cls ? null : 
//                                 c(Button, {
//                                     id:'make_'+t,
//                                     className: 'border-white text-start bi-dot',
//                                     variant:'outline-primary', size:'lg',
//                                     onClick:e=> set_store(d=>{ 
//                                         d.make.atom(d, item.cls, null, {r:d.pick.n, t:t, single:true});
//                                         d.studio.panel.show = false;
//                                     }),
//                                 }, 
//                                     c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
//                                 )
//                             )
//                         )
//                     )
//                 ),
//             ),
//         )





















// limited ? null : c(Fragment,{},
//     c('h5',{className:'text-secondary bi-tag'}, ' Tag'),
//     ...d.cat_tags.map(t=>
//         c(Row, {className: 'mt-1 text-left'}, 
//             c(Button, {
//                 id:'make_'+t,
//                 className: 'border-white text-start '+d.node[t].css,
//                 variant:'outline-primary', size:'lg',
//                 onClick:e=> set_store(d=>{ 
//                     d.pick.n.forEach(n=> d.make.edge(d, d.cats[t], n)); 
//                     d.studio.panel.show = false;
//                 }),
//             }, 
//                 c('span',{style:{fontSize:'16px'}}, ' '+d.node[t].tag)
//             )
//         )
//     ),
// ),


                    // c('h5',{className:'text-secondary bi-ui-checks'}, ' '+readable(d.model_tags['b'])),
                    // ...d.boolean_tags.map((t,i)=>
                    //     t==d.model_tags['b'] ? null : c(Row, {className: 'mb-1 text-left '+(i==d.boolean_tags.length-1?'mb-4':'')},
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> set_store(d=>{ 
                    //                 d.make.atom(d, 'b', false, {r:d.pick.n, t:t});
                    //                 d.studio.panel.show = false;
                    //             }),
                    //         }, 
                    //             c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                    //         )
                    //     )
                    // ),
                    // c('h5',{className:'text-secondary bi-text-left'}, ' '+readable(d.model_tags['s'])),
                    // ...d.string_tags.map((t,i)=>//...Object.entries(d.node.meta).map(([t,node])=>
                    //     t==d.model_tags['s'] ? null : c(Row, {className: 'mb-1 text-left '+(i==d.string_tags.length-1?'mb-4':'')},
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> set_store(d=>{ 
                    //                 d.make.atom(d, 's', '', {r:d.pick.n, t:t});
                    //                 d.studio.panel.show = false;
                    //             }),
                    //         }, 
                    //             c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                    //         )
                    //     )
                    // ),
                    // c('h5',{className:'text-secondary bi-plus-slash-minus'}, ' '+readable(d.model_tags['i'])),
                    // ...d.integer_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                    //     t==d.model_tags['i'] ? null : c(Row, {className: 'mb-1 text-left'}, //['decimal','x','y','z'].includes(t) ?
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> set_store(d=>{ 
                    //                 d.make.atom(d, 'i', 0, {r:d.pick.n, t:t});
                    //                 d.studio.panel.show = false;
                    //             }),
                    //         }, 
                    //             c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                    //         )
                    //     )
                    // ),
                    // c('h5',{className:'text-secondary bi-plus-slash-minus'}, ' '+readable(d.model_tags['f'])),
                    // ...d.decimal_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                    //     t==d.model_tags['f'] ? null : c(Row, {className: 'mb-1 text-left'}, //['decimal','x','y','z'].includes(t) ?
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> set_store(d=>{ 
                    //                 d.make.atom(d, 'f', 0, {r:d.pick.n, t:t});
                    //                 d.studio.panel.show = false;
                    //             }),
                    //         }, 
                    //             c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                    //         )
                    //     )
                    // ),

//const limited = !nodes.length || d.graph.admin(d,nodes);


// !nodes.length ? null : c(Col, {}, 
                //     c('i', {className:'text-secondary bi-123', style:{fontSize:'24px'}}), //, color:'primary'
                //     ...d.decimal_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                //         t=='text' ? null : c(Row, {className: 'mt-1 text-left'},
                //             c(Button, {
                //                 id:'make_'+t,
                //                 className: 'border-white text-start',
                //                 variant:'outline-primary', size:'lg',
                //                 onClick:e=> set_store(d=>{ 
                //                     d.make.atom(d, 'f', 0, {r:d.pick.n, t:t});
                //                     d.studio.panel.show = false;
                //                 }),
                //             }, 
                //                 c('span',{style:{fontSize:'18px'}}, ' '+readable(t))
                //             )
                //         )
                //     ),
                // ),


//var items = [];
    // if(nodes.length){
    //     items = items.concat([
    //         {name:' Name',    icon:'bi-triangle',  func(d){
    //             d.make.atom(d, 's', '', {r:d.pick.n, t:'name'})
    //             //return {n:d.make.atom(d, 's', ''), t:'name'};
    //         }},
    //     ]);
    // }

//c('img', {src:node.icon, className:'p-0 m-0'}),

    // items = items.concat([
    //     {name:'Point',    icon:'bi-dot', func(d){
    //         d.make.part(d, 'point', {r:d.pick.n});
    //         //return {n:d.make.part(d, 'line')};
    //     }},
    //     {name:'Line',    icon:'bi-bezier2', func(d){
    //         d.make.part(d, 'line', {r:d.pick.n});
    //         //return {n:d.make.part(d, 'line')};
    //     }},
    //     {name:'Sketch',  icon:'bi-easel',   func(d){
    //         d.make.part(d, 'sketch', {r:d.pick.n});
    //         //return {n:d.make.part(d, 'sketch')};
    //     }},
    //     {name:'Group',  icon:'bi-box-seam',   func(d){
    //         d.make.part(d, 'group', {r:d.pick.n});
    //         //return {n:d.make.part(d, 'group')};
    //     }},
    //     {name:'repeater',  icon:'bi-files',   func(d){
    //         d.make.part(d, 'repeater', {r:d.pick.n});
    //         //return {n:d.make.part(d, 'repeater')};
    //     }},
    // ]);

// ...items.map((item, i)=>
//                     c(Row, {className: 'mt-1 text-left'},
//                         c(Button, {
//                             id:'make_'+item.value,
//                             className: 'border-white text-start '+item.icon,
//                             variant:'outline-primary', size:'lg',
//                             onClick:e=> set_store(d=>{ 
//                                 item.func(d);
//                                 d.studio.panel.show = false;
//                             }),
//                         }, c('span',{style:{fontSize:'18px'}}, ' '+item.name))
//                     )
//                 ),

// const result = item.func(d);
// d.pick.n.forEach(r=>{
//     d.make.edge(d, r, result.n, {t:result.t}); 
// });

// if(d.pick.n.length){
//     d.pick.n.forEach(n => {
//         item.func(d,n);
//     });
// }else{
//     item.func(d);
// }