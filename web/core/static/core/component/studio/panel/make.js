import {createElement as c, Fragment} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import {useS, ss, gs} from '../../../app.js'
import {Badge} from '../../node/base.js'

export function Make(){
    const show = useS(d=> d.studio.panel.show);
    const panel = useS(d=> d.studio.panel.name);
    const nodes = useS(d=> d.pick.n);
    var items = [];
    if(nodes.length){
        items = items.concat([
            {name:' Name',    icon:'bi-triangle',  func(d){
                d.make.atom(d, 's', '', {r:d.pick.n, t:'name'})
                //return {n:d.make.atom(d, 's', ''), t:'name'};
            }},
        ]);
    }
    items = items.concat([
        {name:' Line',    icon:'bi-bezier2', func(d){
            d.make.part(d, 'line', {r:d.pick.n});
            //return {n:d.make.part(d, 'line')};
        }},
        {name:' Sketch',  icon:'bi-easel',   func(d){
            d.make.part(d, 'sketch', {r:d.pick.n});
            //return {n:d.make.part(d, 'sketch')};
        }},
        {name:' Group',  icon:'bi-box-seam',   func(d){
            d.make.part(d, 'group', {r:d.pick.n});
            //return {n:d.make.part(d, 'group')};
        }},
        {name:' Equalizer',  icon:'bi-files',   func(d){
            d.make.part(d, 'equalizer', {r:d.pick.n});
            //return {n:d.make.part(d, 'equalizer')};
        }},
    ]);
    const d = gs();
    return(
        show && panel=='make' && c(Fragment, {},
            c(Row, {className:'row-cols-auto gap-2 mb-3 ms-1 me-4'}, //className:'ms-1 me-1'
                nodes.length ? nodes.map(n=>
                    c(Col,{className:'ps-0 pe-0'}, // might need to add key to keep things straight 
                        c(Badge, {n:n})
                    ) 
                ) : c(Col,{className:'ps-0 pe-0'}, c(Badge, {n:d.profile})),
            ),
            c(Col, {className:'mb-3 ms-2 me-2'},
                ...items.map((item, i)=>
                    c(Row, {className: 'mt-1 text-left'},
                        c(Button, {
                            id:'make_'+item.value,
                            className: 'border-white text-start '+item.icon,
                            variant:'outline-primary', size:'lg',
                            onClick:e=> ss(d=>{ 
                                // const result = item.func(d);
                                // d.pick.n.forEach(r=>{
                                //     d.make.edge(d, r, result.n, {t:result.t}); 
                                // });
                                item.func(d);
                                d.studio.panel.show = false;
                            }),
                        }, c('span',{style:{fontSize:'18px'}}, item.name))
                    )
                ),
            ),
        )
    )
}

// if(d.pick.n.length){
//     d.pick.n.forEach(n => {
//         item.func(d,n);
//     });
// }else{
//     item.func(d);
// }