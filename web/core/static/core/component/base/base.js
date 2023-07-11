import {createElement as c, StrictMode, useEffect, useState, useRef, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {random_vector} from '../../app.js';

export const Fix_Size = forwardRef((props, ref)=>{ //{size, props, children}
    var obj = null;
    //const {camera} = useThree();
    useFrame((state) => { 
        var factor = props.size / state.camera.zoom; // must account for camera distance if perspective ?!?!?!?!
        obj.scale.set(factor,factor,factor);
    });
    return (c('group', {...props, ref:r=>{
        obj = r; 
        if(ref) ref.current = r; 
    }}))
});

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