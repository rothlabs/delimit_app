import {createElement as c, memo} from 'react';
import {useS} from '../../app.js';
import {View_Transform, Pickable} from '../node/base.js'; // Root_Transform
import {DoubleSide} from 'three';
import {Line} from '@react-three/drei/Line';

const res = 1;

export const Image = memo(({n})=>{ 
    const color = useS(d=> d.n[n].pick.color); 
    const pick = useS(d=> (d.n[n].pick.pick || d.n[n].pick.hover));
    const es = useS(d=> d.easel_size); 
    const texture = useS(d=> d.n[n].c.texture);
    //console.log('render image');
    return(
        //c(Root_Transform, {n:n},
            c(Pickable, {n:n, brushable:true, penable:true}, 
                c(View_Transform, {offset_z:1},
                    c('mesh', {
                        //rotation: [0,0,Math.PI/2],
                    },
                        c('planeGeometry', {args:[es, es, 1, 1]}),
                        c('meshBasicMaterial', {   
                            map: texture,
                            toneMapped: false, 
                            side: DoubleSide,
                        }), 
                    ),
                ),
                c(Line, {
                    points: [-es/2,-es/2,0, es/2,-es/2,0, es/2,es/2,0, -es/2,es/2,0, -es/2,-es/2,0],
                    lineWidth: pick ? 4 : 3,
                    color: color[0],
                })
            )
        //)
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
