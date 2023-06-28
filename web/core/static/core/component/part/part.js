import {createElement as c} from 'react';
import {useS, gs} from '../../app.js';
//import {Line} from './line.js';
//import {Group} from './group.js';

// export const compnt = {
//     'group':       Group,
//     'product':     Group,
//     'sketch':      Group,
//     'repeater':    Group,
//     'line':        Line,
//     'mixed_line':  Line,
// };
// export const compnt_list = Object.keys(compnt);

export function Part(){ // check if in design mode
    const part = useS(d=> d.design.part);
    const d = gs();
    const component = d.component[gs().n[part].t];
    //console.log('part render');
    return (
        component && c(component, {n:part})
    )
}
