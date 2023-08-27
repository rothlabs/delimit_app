import {createElement as c, useRef, memo, useEffect} from 'react';
import {gs, useS, useSub, useSubS, ss, fs, rs} from '../../app.js';
import {Pickable} from '../node/base.js';
import {Matrix4, Vector3} from 'three';

// const v1 = new Vector3();
// const v2 = new Vector3();
// const up = new Vector3(0,1,0);
const m1 = new Matrix4();

export const Transform = memo(({n})=>{ 
    const face_camera = useS(d=> d.n[n].c.face_camera); 
    useSub(d=> d.cam_info, cam_info=>{//[d.cam_info, d.studio.mode], ([cam_info, studio_mode])=>{ // also check studio mode ?!?! #1
        if(face_camera){
            rs(d=>{ // reckons causing a bunch of rerenders?!
                if(d.n[n].ax.base_matrix){
                    m1.extractRotation(cam_info.matrix);
                    d.n[n].ax.base_matrix = {n:n, o:0, c:m1.clone()};
                    d.reckon.matrix(d, n, 'ax', d.add_nc, d.n[n].ax.base_matrix);
                    d.cast.down(d, n, 'base_matrix');
                }
            });
        }
    });
    console.log('render transform');
    return(
        null
    )
})



//m1.lookAt(v1.setFromMatrixPosition(d.n[n].ax.matrix), v2.copy(cam_info.pos).negate(), up);


// maybe for app.js:
// Object.keys(d.n).forEach(n=>{
                //     if(d.n[n].t == 'transform'){
                //         //d.reckon.up(d, n); // d.next ?!?!?!?!
                //         console.log('fix transform');
                //         if(d.n[n].c.face_camera && d.n[n].ax.base_matrix){
                //             m1.lookAt(v1.setFromMatrixPosition(d.n[n].ax.matrix), v2.copy(d.studio.cam_info.pos).negate(), up);
                //             d.n[n].ax.base_matrix = {n:n, o:0, c:m1.clone()};
                //             d.reckon.matrix(d, n, 'ax', d.add_nc, d.n[n].ax.base_matrix);
                //             d.cast.down(d, n, 'base_matrix');
                //             //console.log('faced camera!'); 
                //         }
                //     }
                // });

