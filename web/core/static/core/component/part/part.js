import {createElement as c, useRef, useEffect, useState} from 'react';
import {useS, useSS, gs, ss} from '../../app.js';
//import {Line} from './line.js';
//import {Group} from './group.js';
import {Point} from './point.js';
import {Curve} from './curve.js';
import {Surface} from './surface.js';


// export function Part(){ // check if in design mode
//     const parts = useS(d=> d.design.n);
//     return (
//         c(Part_Group)
//     )
// }

// const component = {
//     // 'group':       Group,
//     // 'product':     Group,
//     // 'sketch':      Group,
//     // 'repeater':    Group,
//     'point':       Point,
//     'curve':       Curve,
//     'mixed_curve': Curve,
//     'surface':     Surface,
// };

export function Part(){
    //const obj = useRef();
    //const [id, set_id] = useState('123');
    const parts = useS(d=> d.design.n);
    // useEffect(()=>{
    //     //if(obj.current) ss(d=> d.design.group = obj.current);
    //     //set_id(Math.random().toString());
    // },[obj]);
    const d = gs();
    //const component = d.component[gs().n[part].t];
    console.log('render parts');//, obj.current?.children);
    return (
        c('group', {
            //ref: obj,
            name: 'parts',
            //key: id,
        },
            ...parts.map(n=> 
                c(d.component[d.n[n].t], {n:n, key:n}) // d.node.be(d,n) && 
            ),
        )
    )
}

// export const compnt = {
//     'group':       Group,
//     'product':     Group,
//     'sketch':      Group,
//     'repeater':    Group,
//     'line':        Line,
//     'mixed_curve':  Line,
// };
// export const compnt_list = Object.keys(compnt);

// export function Part(){ // check if in design mode
//     const part = useS(d=> d.design.part);
//     const d = gs();
//     const component = d.component[gs().n[part].t];
//     //console.log('part render');
//     return (
//         component && c(component, {n:part})
//     )
// }
