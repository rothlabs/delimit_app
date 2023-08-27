import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSubS, useSub, gs} from '../../app.js';
import {Pickable} from '../node/base.js';
import {DoubleSide, ShapeGeometry, BufferGeometry} from 'three';
import {Root_Transform, View_Transform} from '../node/base.js';

const res = 100;

export const Shape = memo(({n})=>{ 
    //const obj = useRef();
    const mesh = useRef();
    const point_size = useS(d=> d.point_size);
    const color = useS(d=> d.n[n].pick.color); 
    const [geo] = useState(new BufferGeometry()); //new BufferGeometry()
    useSub(d=> d.n[n].c.shape, shape=>{ 
        if(shape) mesh.current.geometry.copy(new ShapeGeometry(shape, res));
    });
    // useSubS(d=> [d.n[n].c.matrix, d.n[n].ax.matrix], c=>{ 
    //     obj.current.position.set( 0, 0, 0 );
    //     obj.current.rotation.set( 0, 0, 0 );
    //     obj.current.scale.set( 1, 1, 1 );
    //     if(c[0]) obj.current.applyMatrix4(c[0]);
    //     if(c[1]) obj.current.applyMatrix4(c[1]);
    // });
    //console.log('render surface');
    //const d = gs();
    return(
        // c('group', {
        //     ref: obj,
        // },
        c(Root_Transform, {n:n},
            c(Pickable, {n:n}, 
                c(View_Transform, {offset_z:point_size/2},
                    c('mesh', {
                        ref: mesh,
                        geometry:geo,
                    },
                        c('meshBasicMaterial', {   
                            //map: d.base_texture,
                            color: color[1], 
                            wireframe: false, 
                            toneMapped: true, 
                            side: DoubleSide,
                        }), 
                    ),
                ),
            )
        )
    )
});
