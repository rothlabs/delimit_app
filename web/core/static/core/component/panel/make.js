import {createElement as c, Fragment} from 'react';
import {Row, Col, Button, Container} from 'react-bootstrap';
import {useS, ss, gs, static_url, readable, theme} from '../../app.js'
//import {Badge} from '../node/base.js'

//import { ReactComponent as PublicIcon } from '../../../icon/node/public.svg';

export function Make(){
    //const show = useS(d=> d.studio.panel.show);
    const panel = useS(d=> d.studio.panel.name);
    //const nodes = useS(d=> d.pick.n);
    const limited = useS(d=> d.pick.limited); 
    const d = gs();
    return(
        //show && panel=='make' && c(Fragment, {},
        panel=='make' && c(Fragment, {},
            c(Row, {className:'mb-3 ms-0 me-0'},
                c(Col, {}, 
                    //c('i', {className:'text-secondary bi-diagram-3', style:{fontSize:'28px'}}, c('h4',{}, 'Subjects')),
                    c('h5',{className:'text-secondary bi-diagram-3'}, ' Node'),
                    ...d.subject_tags.map((t,i)=>//...Object.entries(d.node.meta).map(([t,node])=>
                        c(Row, {className: 'mt-1 text-left '+(i==d.subject_tags.length-1?'mb-4':'')},
                            c(Button, {
                                id:'make_'+t,
                                className: 'border-white text-start '+d.node[t].css,
                                variant:'outline-primary', size:'lg',
                                onClick:e=> ss(d=>{ 
                                    d.make.part(d, t, {r:d.pick.n});
                                    d.studio.panel.show = false;
                                }),
                            }, 
                                c('span',{style:{fontSize:'16px'}}, ' '+d.node[t].tag)
                            )
                        )
                    ),
                ),
                limited ? null : c(Col, {}, 
                    [{m:'s',  v:'',    tags:d.string_tags, icon:'bi-text-left'},
                     {m:'b',  v:false, tags:d.bool_tags,   icon:'bi-ui-checks'},
                     {m:'i',  v:0,     tags:d.int_tags,    icon:'bi-plus-slash-minus'},
                     {m:'f',  v:0,     tags:d.float_tags,  icon:'bi-plus-slash-minus'}].map(item=>
                        c(Row, {},
                            c('h5',{className:'text-secondary '+item.icon}, ' '+readable(d.model_tags[item.m])),
                            item.tags.map((t,i)=>
                                t==d.model_tags[item.m] ? null : c(Row, {className: 'mb-1 text-left '+(i==item.tags.length-1?'mb-4':'')},
                                    c(Button, {
                                        id:'make_'+t,
                                        className: 'border-white text-start bi-dot',
                                        variant:'outline-primary', size:'lg',
                                        onClick:e=> ss(d=>{ 
                                            d.make.atom(d, item.m, item.v, {r:d.pick.n, t:t, single:true});
                                            d.studio.panel.show = false;
                                        }),
                                    }, 
                                        c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                                    )
                                )
                            )
                        )
                    ),
                ),
            ),
        )
    )
}


// limited ? null : c(Fragment,{},
//     c('h5',{className:'text-secondary bi-tag'}, ' Tag'),
//     ...d.cat_tags.map(t=>
//         c(Row, {className: 'mt-1 text-left'}, 
//             c(Button, {
//                 id:'make_'+t,
//                 className: 'border-white text-start '+d.node[t].css,
//                 variant:'outline-primary', size:'lg',
//                 onClick:e=> ss(d=>{ 
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
                    // ...d.bool_tags.map((t,i)=>
                    //     t==d.model_tags['b'] ? null : c(Row, {className: 'mb-1 text-left '+(i==d.bool_tags.length-1?'mb-4':'')},
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> ss(d=>{ 
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
                    //             onClick:e=> ss(d=>{ 
                    //                 d.make.atom(d, 's', '', {r:d.pick.n, t:t});
                    //                 d.studio.panel.show = false;
                    //             }),
                    //         }, 
                    //             c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                    //         )
                    //     )
                    // ),
                    // c('h5',{className:'text-secondary bi-plus-slash-minus'}, ' '+readable(d.model_tags['i'])),
                    // ...d.int_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                    //     t==d.model_tags['i'] ? null : c(Row, {className: 'mb-1 text-left'}, //['decimal','x','y','z'].includes(t) ?
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> ss(d=>{ 
                    //                 d.make.atom(d, 'i', 0, {r:d.pick.n, t:t});
                    //                 d.studio.panel.show = false;
                    //             }),
                    //         }, 
                    //             c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                    //         )
                    //     )
                    // ),
                    // c('h5',{className:'text-secondary bi-plus-slash-minus'}, ' '+readable(d.model_tags['f'])),
                    // ...d.float_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                    //     t==d.model_tags['f'] ? null : c(Row, {className: 'mb-1 text-left'}, //['decimal','x','y','z'].includes(t) ?
                    //         c(Button, {
                    //             id:'make_'+t,
                    //             className: 'border-white text-start bi-dot',
                    //             variant:'outline-primary', size:'lg',
                    //             onClick:e=> ss(d=>{ 
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
                //     ...d.float_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                //         t=='text' ? null : c(Row, {className: 'mt-1 text-left'},
                //             c(Button, {
                //                 id:'make_'+t,
                //                 className: 'border-white text-start',
                //                 variant:'outline-primary', size:'lg',
                //                 onClick:e=> ss(d=>{ 
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
//                             onClick:e=> ss(d=>{ 
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