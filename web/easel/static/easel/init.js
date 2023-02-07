import ReactDOM from 'react_dom';
import {createElement as rce, useRef, useState, useEffect } from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Camera_Control_2D} from 'core/camera_control.js';
import {Vector2} from 'three';
import {Product} from 'easel/product.js';
import {Line} from 'easel/line.js';
import {Toolbar} from 'easel/toolbar.js'


const pointer_start = new Vector2();
const pointer_vect = new Vector2();
const new_verts = [];
var pointers_down = 0;

function Board() {
    //const mesh = useRef();
    const [draw_verts, set_draw_verts] = useState();
    const [mod_verts, set_mod_verts] = useState();
    const [selection, set_selection] = useState();
    //const [pointer_up, set_pointer_up] = useState();
    //const [pointer_down, set_pointer_down] = useState();
    //useEffect(()=>{
    //	console.log('selection changed');
    //},[selection]);
    //const [pointer_start, set_pointer_start] = useState();
    //function on_pointer_move(event){
        // console.log(pointers_down);
        // if(!(typeof event.touches === 'undefined') && event.touches.length > 1) { 
        //     console.log('two finger');
        //     pointer_start.set(-1,-1);
        // }
        // if(pointer_start.x>-1 && selection && selection.name != 'board'){
        //     pointer_vect.set(event.clientX,event.clientY);
        //     if(pointer_start.distanceTo(pointer_vect) > 2){
        //         new_verts.push(event.intersections[0].point.x);
        //         new_verts.push(event.intersections[0].point.y);
        //         new_verts.push(0);
        //         set_draw_verts(new Float32Array(new_verts));
        //     }
        // }
    //}
    // useEffect(()=>{
    //     if(pointer_up && [0,1].includes(pointer_up.which)){
    //         pointers_down--;
    //         pointer_start.set(-1,-1);
    //         set_mod_verts(new Float32Array(new_verts));
    //         new_verts.length = 0;
    //         set_draw_verts(new Float32Array());
    //     }
    // },[pointer_up]);
    return (
        rce('mesh', { // on_pointer_up fires twice. The other pointer events might do the same.
            //ref: mesh, 
            name: 'board',
            onClick:(event)=>{
                event.stopPropagation();
                if(event.delta < 3){
                    set_selection(event.intersections[0].object)
                }
            },
            onPointerDown:(event)=> {
                event.stopPropagation();
                if([0,1].includes(event.which)){
                    pointers_down++;
                    pointer_start.set(event.clientX,event.clientY);
                }
            },
            onPointerUp:(event)=>{
                event.stopPropagation();
                if([0,1].includes(event.which)){
                    pointers_down--;
                    if(new_verts.length > 4){
                        set_mod_verts(new Float32Array(new_verts));
                    }
                    new_verts.length = 0;
                    set_draw_verts(new Float32Array());
                }
            }, 
            onPointerMove:(event)=>{
                event.stopPropagation();
                if(pointers_down==1 && selection && selection.name != 'board'){
                    pointer_vect.set(event.clientX,event.clientY);
                    if(pointer_start.distanceTo(pointer_vect) > 2){
                        new_verts.push(event.intersections[event.intersections.length-1].point.x);
                        new_verts.push(event.intersections[event.intersections.length-1].point.y);
                        new_verts.push(1);
                        set_draw_verts(new Float32Array(new_verts));
                    }
                }
            },
        },[   
            rce('planeGeometry', {args:[10000, 10000]}),
            rce('meshBasicMaterial', {color:'white', toneMapped:false}),
            rce(Product, {mod_verts:mod_verts, selection:selection}),
            rce(Line, {verts:draw_verts, selection:'off'}), // temp drawing line for visualization
        ])
    )
}

function Base(){
    return ([
        rce('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
            rce(Canvas,{orthographic: true, camera:{position:[0, 0, 100]}},[
                rce(Camera_Control_2D),
                rce(Board),
            ])
        ),
        rce(Toolbar),  
    ])
}

ReactDOM.createRoot(document.getElementById('app')).render(Base());


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
