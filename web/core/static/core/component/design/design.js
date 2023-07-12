import {createElement as c, useRef, useEffect, useState} from 'react';
import {useS, useSS, gs, ss} from '../../app.js';
import {Fix_Size} from '../base/base.js';
import {GizmoHelper} from '@react-three/drei/GizmoHelper';
//import {GizmoViewport} from '@react-three/drei/GizmoViewport';
import {GizmoViewport} from '../../three/GizmoViewport.js';
import {Mover} from '../studio/mover.js';
//import {Line} from './line.js';
//import {Group} from './group.js';
// import {Point} from './point.js';
// import {Curve} from './curve.js';
// import {Surface} from './surface.js';


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

export function Design(){
    //const obj = useRef();
    //const [id, set_id] = useState('123');
    const parts = useS(d=> d.design.n);
    // useEffect(()=>{
    //     //if(obj.current) ss(d=> d.design.group = obj.current);
    //     //set_id(Math.random().toString());
    // },[obj]);
    const d = gs();
    //const component = d.component[gs().n[part].t];
    //console.log('render design');//, obj.current?.children);
    return (
        c('group', {
            name: 'parts',
        },
            ...parts.map(n=> 
                c(d.component[d.n[n].t], {n:n, key:n}) // d.node.be(d,n) && 
            ),
            c(Mover),
            c(Fix_Size, {
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
