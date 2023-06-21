import {createElement as c, useRef} from 'react';
import {useS, theme, Fixed_Size_Group} from '../../app.js';
import {Points, Point} from '@react-three/drei/Points';
import {PointMaterial} from '@react-three/drei/PointMaterial'; 
import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import { Pickable } from '../node/base.js';
import {Sphere, Vector3, CircleGeometry} from 'three';
//import {Circle} from '';
//import {Color} from '@react-three/fiber';

// renders every frame while dragging which is bad for performance
// fix by subscribing to state in useEffect

const circle_geometry = new CircleGeometry(1,12);

//const tv = new Vector3();
//const bounding_sphere = new Sphere(tv, 10000);

export function Line({n}){ 
    const p_ref = useRef();
    const points = useS(d=> d.n[n].c.point);
    const color = useS(d=> d.n[n].pick.color); 
    if(p_ref.current){
        //p_ref.current.geometry.boundingSphere = bounding_sphere;
        //console.log('render line',p_ref.current, p_ref.current.geometry); // increase bounding sphere radius or recenter?
    }
    return(
        c('group', {name:'line'},
            points && c('group', {
                name:'points',
            },
            ...points.map(p=>   // use frame and sub to update positions
                    c(Fixed_Size_Group, { // renamed to Fix_Size or Static_Size
                        size: 7, // 1.5 : 1, adjust size of other items
                        props:{position: [p.pos.x, p.pos.y, p.pos.z+100],}
                    },
                        c(Pickable, {n:p.n}, c('mesh', {name:'point', geometry:circle_geometry,},
                            c('meshBasicMaterial', {color:p.color, toneMapped:false}),
                        )),
                    ),
                ),
            ),
            // points && c(Points, {ref:p_ref, limit:1000, range:1000}, 
            //     c(PointMaterial, {size:14, vertexColors:true, toneMapped:false, transparent:true}),
            //     ...points.map(p=> c(Pickable, {n:p.n}, 
            //         c(Point, {position: [p.pos.x, p.pos.y, p.pos.z+100], color:p.color}) 
            //     )),
            // ),
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