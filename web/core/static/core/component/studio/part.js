import {createElement as c} from 'react';
import {useS, gs} from '../../app.js';
import {Line} from '../part/line.js';

const components = {
    'line': Line,
};

export function Part(){
    const part = useS(d=> d.design.part);
    const component = components[gs().n[part].t];
    return (
        component && c(component, {n:part})
    )
}
