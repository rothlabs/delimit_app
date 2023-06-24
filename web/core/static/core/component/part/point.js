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
    const pos = useS(d=> d.n[n].c.pos);
    const color = useS(d=> d.n[n].pick.color); 
    return(
        c(Fixed_Size_Group, { // renamed to Fix_Size or Static_Size
            size: 7, // 1.5 : 1, adjust size of other items
            props:{position: [pos.x, pos.y, pos.z+100],}
        },
            c(Pickable, {n:n}, 
                c('mesh', {
                    name:'point', 
                    geometry:circle_geometry,
                },
                    c('meshBasicMaterial', {color:color, toneMapped:false}),
                )
            ),
        )
    )
}