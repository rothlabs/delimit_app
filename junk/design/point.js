import {createElement as c, useRef, memo, useEffect} from 'react';
import {gs, useS, useSub, ss} from '../../app.js';
import {Pickable} from '../node/base.js';
//import {SphereGeometry, CircleGeometry, DoubleSide} from 'three';
//import {useThree} from '@react-three/fiber';
import {View_Transform} from '../node/base.js';

export const Point = memo(({n})=>{//export function Point({n}){ 
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    const pick = useS(d=> (d.n[n].pick.pick || d.n[n].pick.hover));
    const size = useS(d=> d.point_size);
    useSub(d=> d.n[n].p, pnt=>{
        if(pnt) obj.current.position.set(pnt.x, pnt.y, pnt.z);
    });
    //console.log('render point', n, deleted);
    return(
        //c(Root_Transform, {n:r},
            c(View_Transform, { // renamed to View_Transform or Static_Size
                ref:   obj,
                name: 'point',
                size:  pick ? size*1.2 : size, 
            },
                c(Pickable, {n:n}, 
                    c('mesh', {},
                        c('sphereGeometry'),
                        c('meshBasicMaterial', {color:color[0], toneMapped:false}),
                    ),
                ),
            )
        //)
    )
})

//import {Circle} from '';
//import {Color} from '@react-three/fiber';

// renders every frame while dragging which is bad for performance
// fix by subscribing to state in useEffect

//const sphere_geometry = new SphereGeometry(1,12);

//const tv = new Vector3();
//const bounding_sphere = new Sphere(tv, 10000);

//const deleted = useS(d=> d.n[n].deleted); 
    //const {scene} = useThree();
    // useEffect(()=>{
    //     if(obj.current){
    //         //console.log(obj.current);
    //         ss(d=> d.n[n].c.object3D = obj.current);
    //     }
    //     //if(deleted) scene.remove(obj.current);
    // },[obj]);

// , [obj.current]  // find way to forward more props from fixed size group
    // useEffect(()=>subS(d=> d.n[n].w.pos, pos=>{ // make useSub that includes useEffect
    //     obj.current.obj.position.copy(pos);
    // }),[]); 
    //const pos = gs().n[n].w.pos;
    //console.log('render point', n);

    //const pos = useS(d=> d.n[n].w.pos);