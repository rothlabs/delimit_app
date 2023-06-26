import {createElement as c, Fragment} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import {useS, ss, gs, static_url, readable, theme} from '../../../app.js'
import {Badge} from '../../node/base.js'

//import { ReactComponent as PublicIcon } from '../../../icon/node/public.svg';

export function Make(){
    const show = useS(d=> d.studio.panel.show);
    const panel = useS(d=> d.studio.panel.name);
    const nodes = useS(d=> d.pick.n);
    const d = gs();
    const limited = !nodes.length || d.node.admin(d,nodes);
    return(
        show && panel=='make' && c(Fragment, {},
            c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
                limited ? c(Col,{className:'ps-0 pe-0'}, c(Badge, {n:d.profile})) :
                nodes.map(n=>
                    c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
                        c(Badge, {n:n})
                    ) 
                ),
            ),
            c(Row, {className:'mb-3 ms-0 me-0'},
                c(Col, {}, 
                    //c('i', {className:'text-secondary bi-diagram-3', style:{fontSize:'28px'}}, c('h4',{}, 'Subjects')),
                    c('h5',{className:'text-secondary bi-diagram-3'}, ' Subject'),
                    ...d.subject_tags.map((t,i)=>//...Object.entries(d.node.meta).map(([t,node])=>
                        c(Row, {className: 'mt-1 text-left '+(i==d.subject_tags.length-1?'mb-4':'')},
                            c(Button, {
                                id:'make_'+t,
                                className: 'border-white text-start '+d.node.meta[t].css,
                                variant:'outline-primary', size:'lg',
                                onClick:e=> ss(d=>{ 
                                    d.make.part(d, t, {r:d.pick.n});
                                    d.studio.panel.show = false;
                                }),
                            }, 
                                c('span',{style:{fontSize:'16px'}}, ' '+d.node.meta[t].tag)
                            )
                        )
                    ),
                    limited ? null : c(Fragment,{},
                        c('h5',{className:'text-secondary bi-tag'}, ' Category'),
                        ...d.category_tags.map(t=>
                            c(Row, {className: 'mt-1 text-left'}, 
                                c(Button, {
                                    id:'make_'+t,
                                    className: 'border-white text-start '+d.node.meta[t].css,
                                    variant:'outline-primary', size:'lg',
                                    onClick:e=> ss(d=>{ 
                                        d.pick.n.forEach(n=> d.make.edge(d, d.cat[t], n)); 
                                        d.studio.panel.show = false;
                                    }),
                                }, 
                                    c('span',{style:{fontSize:'16px'}}, ' '+d.node.meta[t].tag)
                                )
                            )
                        ),
                    ),
                ),
                limited ? null : c(Col, {}, 
                    c('h5',{className:'text-secondary bi-text-left'}, ' Text'),
                    ...d.string_tags.map((t,i)=>//...Object.entries(d.node.meta).map(([t,node])=>
                        t=='text' ? null : c(Row, {className: 'mb-1 text-left '+(i==d.string_tags.length-1?'mb-4':'')},
                            c(Button, {
                                id:'make_'+t,
                                className: 'border-white text-start bi-dot',
                                variant:'outline-primary', size:'lg',
                                onClick:e=> ss(d=>{ 
                                    d.make.atom(d, 's', '', {r:d.pick.n, t:t});
                                    d.studio.panel.show = false;
                                }),
                            }, 
                                c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                            )
                        )
                    ),
                    c('h5',{className:'text-secondary bi-plus-slash-minus'}, ' Quanty'),
                    ...d.float_tags.map(t=>//...Object.entries(d.node.meta).map(([t,node])=>
                        t=='decimal' ? null : c(Row, {className: 'mb-1 text-left'},
                            c(Button, {
                                id:'make_'+t,
                                className: 'border-white text-start bi-dot',
                                variant:'outline-primary', size:'lg',
                                onClick:e=> ss(d=>{ 
                                    d.make.atom(d, 'f', 0, {r:d.pick.n, t:t});
                                    d.studio.panel.show = false;
                                }),
                            }, 
                                c('span',{style:{fontSize:'16px'}}, ' '+readable(t))
                            )
                        )
                    ),
                ),
            ),
        )
    )
}


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