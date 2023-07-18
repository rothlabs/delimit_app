import {createElement as c, StrictMode, useEffect, useState, useRef, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {random_vector} from '../../app.js';
import {Vector3} from 'three';

const v1 = new Vector3();
const v2 = new Vector3();

export const Fix_Size = forwardRef((props, ref)=>{ //{size, props, children}
    var obj = null;
    //const {camera} = useThree();
    useFrame((state) => { 
        if(props.size){
            var factor = props.size / state.camera.zoom; // must account for camera distance if perspective ?!?!?!?!
            obj.scale.set(factor,factor,factor);
        }
        if(props.offset_z){
            state.camera.getWorldDirection(v1);
            obj.getWorldDirection(v2);
            if(v1.dot(v2)>0) obj.position.set(0, 0, props.offset_z / state.camera.zoom);
            else             obj.position.set(0, 0, -props.offset_z / state.camera.zoom);
        }
    });
    return (c('group', {...props, ref:r=>{
        obj = r; 
        if(ref) ref.current = r; 
    }}))
});

// export const Offset_Z = forwardRef((props, ref)=>{ //{size, props, children}
//     var obj = null;
//     useFrame((state) => { 
//         if(obj.current){
//             state.camera.getWorldDirection(v1);
//             obj.current.getWorldDirection(v2);
//             if(v1.dot(v2)>0) obj.current.position.set(0, 0, props.dist / camera.zoom);
//             else             obj.current.position.set(0, 0, -props.dist / camera.zoom);
//         }
//     });
//     return (c('group', {...props, ref:r=>{
//         obj = r; 
//         if(ref) ref.current = r; 
//     }}))
// });

export const Spinner = forwardRef((props, ref)=>{
    var obj = null;
    const [dir, set_dir] = useState(random_vector({min:0.5, max:0.5}));
    useFrame((state, delta) => {
        obj.rotateX(delta * dir.x);
        obj.rotateY(delta * dir.y);
        obj.rotateZ(delta * dir.z);
    });
    return (c('group', {...props, ref:r=>{
        obj = r; 
        if(ref) ref.current = r; 
    }}))
});


//children:children
// useImperativeHandle(ref,()=>({ 
    //    obj:obj.current,
    // }));
    //useEffect(()=> ref.current=obj,[]);