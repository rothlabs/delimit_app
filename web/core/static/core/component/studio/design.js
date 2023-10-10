import {createElement as c, useRef, useEffect, useState} from 'react';
import {useS, useSS, gs, ss, upper} from '../../app.js';
import {View_Transform} from '../node/base.js';
import {GizmoHelper} from '@react-three/drei/GizmoHelper';
import {GizmoViewport} from '../../three/GizmoViewport.js';
import {Mover} from './mover.js';

import {Curve}     from '../design/curve.js';
//import {Ellipse}   from '../design/ellipse.js';
import {Image}     from '../design/image.js';
import {Layer}     from '../design/layer.js';
import {Point}     from '../design/point.js';
//import {Post}      from '../design/post.js';
import {Shape}     from '../design/shape.js';
//import {Slice}     from '../design/slice.js';
import {Sketch}    from '../design/sketch.js';
import {Surface}   from '../design/surface.js';
//import {Transform} from '../design/transform.js';

const design = {
    Curve, 
    //Ellipse, 
    Image, 
    Layer, 
    Point, 
    //Post,
    Shape, 
    //Slice, 
    Sketch, 
    Surface, 
    //Transform,
};

export function Design(){
    //const obj = useRef();
    //const [id, set_id] = useState('123');
    const nodes = useS(d=> d.design.n);
    // useEffect(()=>{
    //     //if(obj.current) ss(d=> d.design.group = obj.current);
    //     //set_id(Math.random().toString());
    // },[obj]);
    const d = gs();
    //const component = d.component[gs().n[part].t];
    //console.log('render design');//, obj.current?.children);
    return (
        c('group', {
            name: 'design',
        },
            nodes.map(n=>{
                //d.n[n].design.vis && c(d.component[d.n[n].t], {n:n, key:n}) // d.node.be(d,n) && 
                if(!d.n[n].design.vis) return;
                let component = design[upper(d.n[n].t)];
                //console.log(d.n[n]);
                component = component ?? (d.n[n].p && design[upper(d.n[n].p.design)]);// : null;
                if(!component) return;
                return c(component, {key:n, n:n})
            }),
            c(Mover),
            c(View_Transform, {
                name:'center_point',
                size:6,
            },
                c('mesh', {},
                    c('sphereGeometry'),
                    c('meshBasicMaterial', {color:'yellow', toneMapped:false}), //, toneMapped:false
                ),
            ),
            c(GizmoHelper, {
                alignment:'bottom-right', // widget alignment within scene
                margin:[80, 80], // widget margins (X, Y)
                //onUpdate={/* called during camera animation  */}
                //onTarget={/* return current camera target (e.g. from orbit controls) to center animation */}
                //renderPriority={/* use renderPriority to prevent the helper from disappearing if there is another useFrame(..., 1)*/}
            },
                c(GizmoViewport, {
                    axisColors:d.axis_colors, 
                    labelColor:'white', 
                    axisHeadScale:1.1, 
                    //font: '24px '+d.base_font,
                    //fontSize:30,
                })
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