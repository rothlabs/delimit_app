import {createElement as c, memo} from 'react';
import {useS} from '../../app.js';
import {Root_Transform, Pickable} from '../node/base.js';
import {DoubleSide} from 'three';

const res = 1;

export const Image = memo(({n})=>{ 
    const texture = useS(d=> d.n[n].c.texture);
    //console.log('render image');
    return(
        c(Root_Transform, {n:n},
            c(Pickable, {n:n, paintable:true}, 
                c('mesh', {},
                    c('planeGeometry', {args:[400, 400, 1, 1]},),
                    c('meshBasicMaterial', {   
                        map: texture,
                        toneMapped: false, 
                        side: DoubleSide,
                    }), 
                ),
            )
        )
    )
});

    //const point_size = useS(d=> d.point_size);
    //const color = useS(d=> d.n[n].pick.color); 
    //const [geo] = useState(new PlaneGeometry(400, 400, 1, 1)); //new BufferGeometry()

    //const [map] = useState(base_texture);
    // useSub(d=> d.n[n].c.texture, texture=>{ // set material map here
    //     if(texture){
    //         //console.log('new map in image component');
    //         mesh.current.material.map = texture;
    //     }
    // });
