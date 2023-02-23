import {createRoot} from 'rdc'; 
import {createElement as r, useRef, useState, Fragment, StrictMode} from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Vector2} from 'three';
import {Product} from 'easel/product.js';
import {Line} from 'easel/line.js';
import {Toolbar} from 'easel/toolbar.js'
import {Main_Navbar} from 'core/navbar.js';
import {CameraControls} from 'drei';

const pointer_start = new Vector2();
const pointer_vect = new Vector2();
const new_verts = [];
var pointers_down = 0;
var raycaster=null;

function Board(p) {
    const {camera} = useThree(); 
    const [selection, set_selection] = useState();
    const product = useRef();
    const draw_line = useRef();

    useFrame(()=>raycaster.params.Points.threshold = 12/camera.zoom);

    return (
        r('mesh', { 
            name: 'board',
            position:[0,0,-100],
            onClick:(event)=>{
                event.stopPropagation();
                if(event.delta < 3 && event.intersections[0].object.name != 'endpoint'){
                    set_selection(event.intersections[0]);
                }
            },
            onPointerDown:(event)=> {
                event.stopPropagation();
                if([0,1].includes(event.which)){
                    pointers_down++;
                    pointer_start.set(event.clientX,event.clientY);
                    if(!(selection && selection.object.name == 'line')){
                        if(event.intersections[0].object.name == 'endpoint'){
                            set_selection(event.intersections[0]);
                        }
                    }
                }
            },
            onPointerUp:(event)=>{
                event.stopPropagation();
                if([0,1].includes(event.which)){
                    pointers_down--;
                    if(selection){ 
                        product.current.set_mod({
                            verts: new Float32Array(new_verts),
                            endpoint: event.intersections[event.intersections.length-1].point,
                        });
                        new_verts.length = 0;
                        draw_line.current.set_verts(new Float32Array());
                        if(selection.object.name == 'endpoint'){
                            set_selection(null); 
                        }
                    }
                }
            }, 
            onPointerMove:(event)=>{
                event.stopPropagation();
                if(pointers_down==1 && selection){
                    const point = event.intersections[event.intersections.length-1].point;
                    if(selection.object.name == 'line'){
                        pointer_vect.set(event.clientX,event.clientY);
                        if(pointer_start.distanceTo(pointer_vect) > 2){
                            new_verts.push(point.x,point.y,1);
                            draw_line.current.set_verts(new Float32Array(new_verts));
                        }
                    }else if(selection.object.name == 'endpoint'){
                        product.current.set_endpoint(point);
                    }
                }
            },
        },   
            r('planeGeometry', {args:[10000, 10000]}),
            r('meshBasicMaterial', {color:'white', toneMapped:false}),
            r(Product, {ref:product, selection:selection, ...p}), 
            r(Line, {ref:draw_line, selection:'off', verts:[], ...p}), // temp drawing line for visualization
        )
    )
}

function Base(){
    const [act,set_act] = useState({name:''});
    const camera_controls = useRef();
    return (r(Fragment,{},
        r(Main_Navbar),
        r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
            r(Canvas,{orthographic: true, camera:{position:[0, 0, 100]}, onCreated:(state)=>raycaster=state.raycaster},
                r(StrictMode,{},
                    r(CameraControls, {ref: camera_controls, polarRotateSpeed:0, azimuthRotateSpeed:0, draggingSmoothTime:0}), //camera:THREE.Orthographic
                    r(Board, {base:{act:act,set_act:set_act}, camera_controls:camera_controls}), 
                )
            )
        ),
        r(Toolbar, {set_act:set_act}),
    ))
}

createRoot(document.getElementById('app')).render(r(StrictMode,{},r(Base)));