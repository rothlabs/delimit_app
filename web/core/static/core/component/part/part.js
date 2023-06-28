import {createElement as c} from 'react';
import {useSS, gs} from '../../app.js';
//import {Line} from './line.js';
//import {Group} from './group.js';

export function Part(){ // check if in design mode
    const nodes = useSS(d=> d.design.n);
    const d = gs();
    //const component = d.component[gs().n[part].t];
    console.log('render parts');
    return (
        c('group', {name:'parts'},
            ...nodes.map(n=> c(d.component[d.n[n].t], {n:n, key:n})),
        )
    )
}

// export const compnt = {
//     'group':       Group,
//     'product':     Group,
//     'sketch':      Group,
//     'repeater':    Group,
//     'line':        Line,
//     'mixed_line':  Line,
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
