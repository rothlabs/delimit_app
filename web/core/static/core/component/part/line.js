import {createElement as c, useEffect, useState} from 'react';
import {gs, ss, ssp, useS, theme} from '../../app.js';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {Points, Point} from '@react-three/drei/Points';
import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import { Pickable } from '../node/base.js';

export function Line({n}){
    const points = useS(d=> d.n[n].c.points);
    const color = useS(d=> d.n[n].pick.color); 
    //const hover = useS(d=> d.n[n].hover); 
    //const picked = useS(d=> d.n[n].picked);
    //console.log('render line')
    return(
        c('group', {name:'line'},
            points && c(Points, {limit:1000, range:1000}, 
                c(PointMaterial, {size:14, vertexColors:true, toneMapped:false, transparent:true}),
                ...points.map(p=> c(Pickable, {n:p.n},
                    c(Point, {position: [p.x, p.y, p.z+50], color:p.color}) //onClick:e=>{console.log('click point')}
                )),
            ),
            points && points.length>1 && c(Pickable, {n:n},
                c(CatmullRomLine, {
                    points: points.map(p=> [p.x, p.y, p.z]),
                    lineWidth: 3,
                    color: color[0],
                    segments: 100, // need to make this adjustable or dependent on zoom or line length 
                }),
            ),
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