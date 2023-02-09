import ReactDOM from 'react_dom';
import {createElement as r, useRef, useState, useEffect } from 'react';
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

function Board(p) {
    const [draw_verts, set_draw_verts] = useState();
    const [mod_verts, set_mod_verts] = useState();
    const [selection, set_selection] = useState();

    return (
        r('mesh', { 
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
            r('planeGeometry', {args:[10000, 10000]}),
            r('meshBasicMaterial', {color:'white', toneMapped:false}),
            r(Product, {mod_verts:mod_verts, selection:selection, ...p}),
            r(Line, {verts:draw_verts, selection:'off', ...p}), // temp drawing line for visualization
        ])
    )
}

function Base(){
    const [action,set_action] = useState();
    return ([
        r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
            r(Canvas,{orthographic: true, camera:{position:[0, 0, 100]}},[
                r(Camera_Control_2D),
                r(Board, {base:{action:action,set_action:set_action}}),
            ])
        ),
        r(Toolbar, {set_action:set_action}),
    ])
}

ReactDOM.createRoot(document.getElementById('app')).render(r(Base));


//r('directionalLight', {position: [10,10,10]}),

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
