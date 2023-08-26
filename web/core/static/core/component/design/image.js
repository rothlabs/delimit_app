import {createElement as c, useRef, memo, useState, useEffect} from 'react';
import {useS, useSubS, useSub, gs} from '../../app.js';
import {Pickable} from '../node/base.js';
import {DoubleSide, PlaneGeometry, BufferGeometry} from 'three';
import {Fix_Size} from '../base/base.js';

const res = 1;

export const Image = memo(({n})=>{ 
    const obj = useRef();
    const mesh = useRef();
    const base_texture = useS(d=> d.base_texture);
    const point_size = useS(d=> d.point_size);
    //const color = useS(d=> d.n[n].pick.color); 
    const [geo] = useState(new PlaneGeometry(400, 400, 1, 1)); //new BufferGeometry()
    const [map] = useState(base_texture);
    useSub(d=> d.n[n].c.map, map=>{ // set material map here
        if(map){
            //console.log('new map in image component');
            mesh.current.material.map = map;
        }
    });
    useSubS(d=> [d.n[n].c.matrix, d.n[n].ax.matrix], c=>{ 
        obj.current.position.set( 0, 0, 0 );
        obj.current.rotation.set( 0, 0, 0 );
        obj.current.scale.set( 1, 1, 1 );
        if(c[0]) obj.current.applyMatrix4(c[0]);
        if(c[1]) obj.current.applyMatrix4(c[1]);
    });
    console.log('render image');
    return(
        c('group', {
            ref: obj,
        },
            c(Pickable, {n:n, paintable:true}, 
                //c(Fix_Size, {offset_z:point_size/2},
                    c('mesh', {
                        ref: mesh,
                        geometry:geo,
                    },
                        c('meshBasicMaterial', {   
                            map: map,
                            //color: color[1], 
                            wireframe: false, 
                            toneMapped: true, 
                            side: DoubleSide,
                        }), 
                    ),
                //),
            )
        )
    )
});
