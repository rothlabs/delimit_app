import ReactDOM from 'react_dom';
import {createElement as rce, useRef, useState, useEffect } from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Camera_Control_2D} from 'core/camera_control.js';
import {Vector2} from 'three';
import {Product} from 'easel/product.js';
import {Line} from 'easel/line.js';

//const rce = React.createElement; 


const pointer_start = new Vector2();
const pointer_vect = new Vector2();
const new_verts = [];

function Board() {
    //const mesh = useRef();
    const [draw_verts, set_draw_verts] = useState();
    const [selection, set_selection] = useState();
    //const [pointer_start, set_pointer_start] = useState();
    function on_pointer_move(event){
        if(pointer_start.x>-1 && selection && selection.name != 'board'){
            pointer_vect.set(event.clientX,event.clientY);
            if(pointer_start.distanceTo(pointer_vect) > 2){
                new_verts.push(event.intersections[0].point.x);
                new_verts.push(event.intersections[0].point.y);
                new_verts.push(0);
                set_draw_verts(new Float32Array(new_verts));
            }
        }
    }
    useEffect(()=>{ 
        console.log(draw_verts);
    },[draw_verts]);
    return (
        rce('mesh', {
            //ref: mesh, 
            name: 'board',
            onClick:(event)=> (event.delta < 3) ? set_selection(event.intersections[0].object) : null,
            onPointerDown:(event)=> {
                if([0,1].includes(event.which)){
                    pointer_start.set(event.clientX,event.clientY);
                    //set_pointer_start(new Vector2(event.clientX,event.clientY));
                }
            },
            onPointerUp:(event)=> {
                if([0,1].includes(event.which)){
                    pointer_start.set(-1,-1);
                    new_verts.length = 0;
                    set_draw_verts(new Float32Array());
                }
            },
            onPointerMove:on_pointer_move,
        },[   
            rce('planeGeometry', {args:[10000, 10000]}),
            rce('meshBasicMaterial', {color:'white', toneMapped:false}),
            rce(Product, {selection:selection}),
            rce(Line, {verts:draw_verts, selection:selection}), // temp drawing line
        ])
    )
}

function Base(args){
    return (
        rce(Canvas,{orthographic: true, camera:{position:[0, 0, 100]}},[
            rce(Camera_Control_2D),
            rce(Board),
        ])
    )
}

ReactDOM.createRoot(document.getElementById('viewport_3d')).render(Base());


//rce('directionalLight', {position: [10,10,10]}),

//import { Base } from 'easel/base.js';
//import { Draw } from 'easel/draw.js';
//import { Product } from 'easel/product.js';
//import { Toolbar } from 'easel/toolbar.js';

//import { make_cubes } from 'easel/cube.js';

//make_cubes(); 

//const base = Base();
//const product = Product(base);
//const draw = Draw(base, product);
//product.draw = draw;
//const toolbar = Toolbar(base, product);

//function update() {
//    base.update();
//    product.fit();
//    draw.fit();
//    window.requestAnimationFrame(update);
//}update();
