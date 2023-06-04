import {createElement as c} from 'react';
import {useSS} from '../../app.js';
//import {Points, Point} from '@react-three/drei/Points';
//import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {Pickable} from '../node/base.js';
import {Line} from './line.js';

// might want sketch to contain and render lose points
export function Sketch({n}){ 
    const lines = useSS(d=> d.n[n].n.line); 
    //console.log('render sketch');
    return(
        lines && c('group', {name:'sketch'},
            ...lines.map(n=> 
                c(Line, {n:n})
            ),
        )
    )
}