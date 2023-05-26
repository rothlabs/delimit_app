import {createElement as c, useEffect, useState} from 'react';
import {gs, ss, useS, theme} from '../../app.js';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {Points, Point} from '@react-three/drei/Points';
import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import { Pickable } from '../node/base.js';
import {PivotControls} from '@react-three/drei/PivotControls';

export function Line({n}){
    const points = useS(d=> d.n[n].c.points);
    const color = useS(d=> d.n[n].pick.color); 
    //const hover = useS(d=> d.n[n].hover); 
    //const picked = useS(d=> d.n[n].picked);
    //console.log('render line')
    const d = gs();
    return(
        c('group', {name:'line'},
            points && c(Points, {limit:1000, range:1000}, 
                c(PointMaterial, {size:14, vertexColors:true, toneMapped:false, transparent:true}),
                // c(PivotControls, {
                //     rotation:[0, 0, 0], //[0, -Math.PI / 2, 0]
                //     anchor:[0, 0, 0],
                //     scale:100,
                //     depthTest:false,
                //     fixed:true,
                //     lineWidth:2,
                // },
                //     ...points.filter(p=> d.n[p.n].pick.picked).map(p=> c(Pickable, {n:p.n},
                //         c(Point, {position: [p.x, p.y, p.z+50], color:p.color}) //onClick:e=>{console.log('click point')}
                //     )),
                //     c('mesh', {},
                //         c('boxGeometry'),
                //         c('meshBasicMaterial', {color:'grey', toneMapped:false}),
                //     )
                // ),
                ...points.map(p=> c(Pickable, {n:p.n}, //filter(p=> !d.n[p.n].pick.picked)
                    c(Point, {position: [p.x, p.y, p.z+50], color:p.color}) //onClick:e=>{console.log('click point')}
                )),
                // ...points.map(p=> c(Pickable, {n:p.n},
                //     c(Point, {position: [p.x, p.y, p.z+50], color:p.color}) //onClick:e=>{console.log('click point')}
                // )),
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