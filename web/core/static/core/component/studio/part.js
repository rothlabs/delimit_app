import {createElement as c} from 'react';
import {useS, gs} from '../../app.js';
import {Line} from '../part/line.js';
import {Sketch} from '../part/sketch.js';

const components = {
    'line':       Line,
    'mixed_line': Line,
    'sketch':     Sketch,
};

export function Part(){
    const part = useS(d=> d.design.part);
    const component = components[gs().n[part].t];
    console.log('part render');
    return (
        component && c(component, {n:part})
    )
}
