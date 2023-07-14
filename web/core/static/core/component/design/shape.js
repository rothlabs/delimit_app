import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
import {Pickable} from '../node/base.js';
import {DoubleSide, ShapeGeometry, BufferGeometry} from 'three';

const res = 100;

export const Shape = memo(({n})=>{ 
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    const [geo] = useState(new BufferGeometry()); //new BufferGeometry()
    useSub(d=> d.n[n].ax.shape, shape=>{ 
        if(shape){ 
            obj.current.geometry.copy(new ShapeGeometry(shape, res));
        }
    });
    //console.log('render surface');
    //const d = gs();
    return(
        //c('group', {},
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
        //)
    )
});
