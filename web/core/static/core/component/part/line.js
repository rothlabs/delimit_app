import {createElement as c} from 'react';
import {useS} from '../../app.js';
import {Points, Point} from '@react-three/drei/Points';
import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import { Pickable } from '../node/base.js';

// renders every frame while dragging which is bad for performance
// fix by subscribing to state in useEffect



export function Line({n}){ 
    const points = useS(d=> d.n[n].c.point);
    const color = useS(d=> d.n[n].pick.color); 
    //console.log('render line');
    return(
        c('group', {name:'line'},
            points && c(Points, {limit:1000, range:1000}, 
                c(PointMaterial, {size:14, vertexColors:true, toneMapped:false, transparent:true}),
                ...points.map(p=> c(Pickable, {n:p.n}, 
                    c(Point, {position: [p.pos.x, p.pos.y, p.pos.z+100], color:p.color}) 
                )),
            ),
            points && points.length>1 && c(Pickable, {n:n},
                c(CatmullRomLine, {
                    points: points.map(p=> [p.pos.x, p.pos.y, p.pos.z]),
                    lineWidth: 3,
                    color: color[0],
                    segments: 100, // need to make this adjustable or dependent on zoom or line length 
                }),
            ),
        )
    )
}