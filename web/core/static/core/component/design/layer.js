import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
import {Pickable} from '../node/base.js';
import {DoubleSide, BufferGeometry} from 'three';

const res = 100;

export const Layer = memo(({n})=>{ 
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    const [geo] = useState(new BufferGeometry()); //new BufferGeometry()
    useSub(d=> d.n[n].ax.geo, geo=>{ 
        if(geo) obj.current.geometry.copy(geo);
    });
    //console.log('render Layer');
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
