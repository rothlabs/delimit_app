import {createElement as c, useEffect, useState} from 'react';
import {gs, ss, ssp, useS, useSS, theme} from '../../app.js';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {Points, Point} from '@react-three/drei/Points';
import {PointMaterial} from '@react-three/drei/PointMaterial';

export function Line({n}){
    //const points = useS(d=> d.n[n].n.point);
    //const x = useSS(d=> d.n[n].n.point.map());
    //const d = gs();
    ////const points = useS(d=> d.n[n].c.points);
    //console.log('render line')
    return(
        c('group', {name:'line'},
            // points && c(Points, {limit:1000, range:1000}, 
            //     c(PointMaterial, {size:10, vertexColors:true}),
            //     ...points.map(p=> 
            //         c(Point, {position:[p.x, p.y, p.z], color:theme.secondary})
            //     ),
            // )
        )
    )
}

// function Dots(){
//     //const nodes = useSS(d=> d.graph.nodes);  
//     console.log('render line dots');
//     return (
//         c(Points, {limit:1000, range:1000}, 
//             c('pointsMaterial', {size:15, vertexColors:[[.5,.5,.5],]}),
//             c(Point, {position:[0,0,10], color:'red'}),
// 		)
//     )
// }