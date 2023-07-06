import {createElement as c} from 'react';
import {useSS, gs} from '../app.js';
//import {Points, Point} from '@react-three/drei/Points';
//import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {Pickable} from '../component/node/base.js';
//import {Line} from './line.js';
//import {component, component_tags} from './part.js';

//const compnt_list = Object.keys(compnt);

// might want sketch to contain and render lose points
export function Group({n}){ 
    //const lines = useSS(d=> d.n[n].n.curve); // not triggering on closed lines ?!?!?!?!
    //const sketches = useSS(d=> d.n[n].n.sketch);
    //const groups = useSS(d=> d.n[n].n.group);
    //const nodes = [...groups, ...sketches];
    const nodes = useSS(d=>{
        var nodes = [];
        d.component_tags.forEach(c=> {
            if(d.n[n].n[c]){
                nodes = nodes.concat(d.n[n].n[c]);
            }
        });
        return nodes;
    });
    //console.log('render group', nodes);
    const d = gs();
    return(
            nodes && c('group', {name:d.n[n].t},
                ...nodes.map(n=> 
                    d.node.be(d,n) && d.component[d.n[n].t] && c(d.component[d.n[n].t], {n:n})
                ),
            )
    )
}

// export function Sketch({n}){ 
//     const lines = useSS(d=> d.n[n].n.curve); // not triggering on closed lines ?!?!?!?!
//     const sketches = useSS(d=> d.n[n].n.sketch);
//     //console.log('render sketch');
//     const d = gs();
//     return(
//         c('group', {name:'sketch'},
//             lines && c('group', {name:'lines'},
//                 ...lines.map(n=> 
//                     d.node.be(d,n) && c(Line, {n:n})
//                 ),
//             ),
//             sketches && c('group', {name:'sketches'},
//                 ...sketches.map(n=> 
//                     d.node.be(d,n) && c(Sketch, {n:n})
//                 ),
//             )
//         )
//     )
// }