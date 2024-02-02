import {createElement as c, useRef, forwardRef, useState} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {useSpring, animated, config, to } from '@react-spring/three';
import {use_store} from 'delimit';

export const Scene_Transform = forwardRef(({scene, size, ...props}, ref)=>{ 
    const obj = useRef();
    const {invalidate} = useThree();
    use_store(d => d.scene.get_vector3({scene, term:'position'}), {subscribe(pos){
        if(obj.current && pos){
            obj.current.position.fromArray(pos);
            invalidate();
        }
    }});
    use_store(d => d.scene.get_vector3({scene, term:'rotation'}), {subscribe(pos){
        if(obj.current && pos){
            obj.current.rotation.fromArray(pos);
            invalidate();
        }
    }});
    return c('group', {
        ...props, 
        ref(r){
            obj.current = r; 
            if(ref) ref.current = r; 
        }
    })
});

export const Sized_Transform = forwardRef(({scene, size, ...props}, ref)=>{ 
    const obj = useRef();
    useFrame((state) => { 
        if(obj.current && size != null){
            let factor = size / state.camera.zoom; // must account for camera distance if perspective ?
            obj.current.scale.set(factor, factor, factor);
        }
    });
    return c('group', {
        ...props, 
        ref(r){
            obj.current = r; 
            if(ref) ref.current = r; 
        }
    })
});

export const Animated_Transform = forwardRef((props, ref)=>{ 
    let obj = null;
    let pos = props.position.isVector3 ? props.position.toArray() : props.position;
    const {position} = useSpring({ // [{position}, spring]
        position: pos,
    });
    useFrame((state) => { // use d.cam_info here? #1
        if(props.size){
            let factor = props.size / state.camera.zoom; // must account for camera distance if perspective ?!?!?!?!
            obj.scale.set(factor,factor,factor);
        }
    });
    return c(animated.group, {
        ...props, 
        position, 
        ref:r=>{
            obj = r; 
            if(ref) ref.current = r; 
        }
    })
});