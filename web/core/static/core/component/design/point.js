import {createElement as c, useRef, memo, useEffect} from 'react';
import {gs, useS, useSub, ss} from '../../app.js';
import {Pickable} from '../node/base.js';
import {CircleGeometry, DoubleSide} from 'three';
//import {useThree} from '@react-three/fiber';
import {Fix_Size} from '../base/base.js';
//import {Circle} from '';
//import {Color} from '@react-three/fiber';

// renders every frame while dragging which is bad for performance
// fix by subscribing to state in useEffect

const circle_geometry = new CircleGeometry(1,12);

//const tv = new Vector3();
//const bounding_sphere = new Sphere(tv, 10000);

export const Point = memo(function Point({n}){//export function Point({n}){ 
    const obj = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    //const deleted = useS(d=> d.n[n].deleted); 
    //const {scene} = useThree();
    // useEffect(()=>{
    //     if(obj.current){
    //         //console.log(obj.current);
    //         ss(d=> d.n[n].c.object3D = obj.current);
    //     }
    //     //if(deleted) scene.remove(obj.current);
    // },[obj]);
    useSub(d=> d.n[n].w.pos, pos=>{
        if(pos) obj.current.position.set(pos.x,pos.y,pos.z+1);
    });
    //console.log('render point', n, deleted);
    return(
        c(Fix_Size, { // renamed to Fix_Size or Static_Size
            ref: obj,
            name:'point',
            size: 6, // 1.5 : 1, adjust size of other items
            //props: {position: [pos.x, pos.y, pos.z+100]},
        },
            c(Pickable, {n:n}, 
                c('mesh', {
                    geometry:circle_geometry,
                },
                    c('meshBasicMaterial', {color:color[0], toneMapped:false, side:DoubleSide,}),
                )
            ),
        )
    )
})

// , [obj.current]  // find way to forward more props from fixed size group
    // useEffect(()=>subS(d=> d.n[n].w.pos, pos=>{ // make useSub that includes useEffect
    //     obj.current.obj.position.copy(pos);
    // }),[]); 
    //const pos = gs().n[n].w.pos;
    //console.log('render point', n);

    //const pos = useS(d=> d.n[n].w.pos);