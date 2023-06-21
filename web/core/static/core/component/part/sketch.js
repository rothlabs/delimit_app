import {createElement as c} from 'react';
import {useSS, gs} from '../../app.js';
//import {Points, Point} from '@react-three/drei/Points';
//import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {Pickable} from '../node/base.js';
import {Line} from './line.js';

// might want sketch to contain and render lose points
export function Sketch({n}){ 
    const lines = useSS(d=> d.n[n].n.line); // not triggering on closed lines ?!?!?!?!
    const sketches = useSS(d=> d.n[n].n.sketch);
    //console.log('render sketch');
    const d = gs();
    return(
        c('group', {name:'sketch'},
            lines && c('group', {name:'lines'},
                ...lines.map(n=> 
                    d.node.be(d,n) && c(Line, {n:n})
                ),
            ),
            sketches && c('group', {name:'sketches'},
                ...sketches.map(n=> 
                    d.node.be(d,n) && c(Sketch, {n:n})
                ),
            )
        )
    )
}