import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
import {Pickable} from '../node/base.js';
import {DoubleSide, BufferGeometry} from 'three';
import {Fix_Size} from '../base/base.js';

const res = 100;

export const Layer = memo(({n})=>{ 
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    const geo = useS(d=> d.n[n].ax.geo); 
    //const ray_pts = useS(d=> d.n[n].c.ray_pts); 
    // const [geo] = useState(new BufferGeometry()); //new BufferGeometry()

    // useSub(d=> d.n[n].ax.geo, geo=>{ 
    //     if(geo) obj.current.geometry.copy(geo);
    // });

    //console.log('render Layer');
    //const d = gs();
    return(
        c('group', {},
            // ray_pts && c('group', {},
            //     ...ray_pts.map(p=>
            //         c(Fix_Size, {size:4, position: [p.pos.x, p.pos.y, p.pos.z]}, // , props:{position: [p.x, p.y, p.z]}
            //             c('mesh', {},
            //                 c('sphereGeometry'),
            //                 c('meshBasicMaterial', {color: p.hit ? 'yellow' : 'grey', toneMapped:false}),
            //             )
            //         )
            //     ),
            // ),
            c(Pickable, {n:n}, 
                c('mesh', {
                    ref: obj,
                    geometry:geo,
                },
                    c('meshStandardMaterial', {   
                        //map: d.base_texture,
                        color: color[1], 
                        wireframe: false, 
                        toneMapped: true, 
                        side: DoubleSide,
                    }), 
                ),
            )
        )
    )
});
