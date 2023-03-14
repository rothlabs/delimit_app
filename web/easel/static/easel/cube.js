import ReactDOM from 'react_dom';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from 'r3f';
import { camera_control_2d } from 'core/camera_control.js';


const rce = React.createElement;

export function make_cubes(){

    function Box(props) {
        const mesh = useRef();
        const [hovered, setHover] = useState(false);
        const [active, setActive] = useState(false);
        //useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
        return rce('mesh', {
            props: props,
            ref: mesh, 
            scale: active ? 1.5 : 1,
            onClick: () => setActive(!active),
            onPointerOver: () => setHover(true),
            onPointerOut: () => setHover(false),},
            [   rce('boxGeometry', {args:[1, 1, 1]}),
                rce('meshStandardMaterial', {color: hovered ? 'hotpink' : 'orange'}),
        ]);
    }

    ReactDOM.createRoot(document.getElementById('viewport_3d')).render(
        rce(Canvas,{orthographic: true, camera:{zoom: 50, position:[0, 0, 100]}},[
            rce(camera_control_2d),
            rce('pointLight', {position: [10,10,10]}),
            rce(Box,{position: [-1.2, 0, -10]})
        ])
    )

}

//rce('OrthographicCamera',{
//    makeDefault: true,
//    zoom: 1,
//    top: 100,
//    bottom: -100,
//    left: 200,
//    right: -200,
//    near: 1,
//    far: 2000,
//    position: [0, 0, 200],
//}),