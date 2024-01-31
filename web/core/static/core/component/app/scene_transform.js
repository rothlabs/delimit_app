import {createElement as c, useRef, forwardRef, useState} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {useSpring, animated, config, to } from '@react-spring/three';
import {use_store} from 'delimit';

export const Scene_Transform = forwardRef(({scene, size, ...props}, ref)=>{ 
    const obj = useRef();
    const {invalidate} = useThree();
    use_store(d => d.scene.get_position({scene}), {subscribe(pos){
        if(obj.current && pos){
            obj.current.position.fromArray(pos);
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

export const Sized_Scene_Transform = forwardRef(({scene, size, ...props}, ref)=>{ 
    const obj = useRef();
    // const {invalidate} = useThree();
    // use_store(d => d.scene.get_position({scene}), {subscribe(pos){
    //     if(obj.current && pos){
    //         obj.current.position.copy(pos);
    //         invalidate();
    //     }
    // }});
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