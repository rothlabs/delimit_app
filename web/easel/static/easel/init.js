import {createRoot} from 'rdc'; 
import {createElement as r, useRef, useState, useEffect, Fragment, StrictMode} from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Camera_Control_2D} from 'core/camera_control.js';
import {Vector2} from 'three';
import {Product} from 'easel/product.js';
import {Line} from 'easel/line.js';
import {Toolbar} from 'easel/toolbar.js'
import {Main_Navbar} from 'core/navbar.js';

const pointer_start = new Vector2();
const pointer_vect = new Vector2();
const new_verts = [];
var pointers_down = 0;
var raycaster=null;

function Board(p) {
    const {camera} = useThree();
    //const [draw_verts, set_draw_verts] = useState([]);
    const [mod_verts, set_mod_verts] = useState();
    const [mod_vertex, set_mod_vertex] = useState();
    const [selection, set_selection] = useState();
    //const [allow_record, set_allow_record] = useState();
    const product = useRef();
    const draw_line = useRef();

    useFrame(()=>raycaster.params.Points.threshold = 12/camera.zoom);

    //useEffect(()=>set_allow_record(true),[mod_vertex]);

    return (
        r('mesh', { 
            name: 'board',
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
                        const point = event.intersections[event.intersections.length-1].point; 
                        set_mod_vertex(point);
                        if(new_verts.length > 5){
                            set_mod_verts(new Float32Array(new_verts));
                        }
                        new_verts.length = 0;
                        draw_line.current.set_verts(new Float32Array());
                        if(selection.object.name == 'endpoint'){
                            set_selection(null);
                        }
                    }
                    //set_draw_verts(new Float32Array());
                    //if(allow_record){
                    //    p.base.set_act({name:'record'});
                    //    set_allow_record(false);
                    //}
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
                            //set_draw_verts(new Float32Array(new_verts));
                        }
                    }else if(selection.object.name == 'endpoint'){
                        product.current.set_endpoint(point);
                        //set_allow_record(true);
                        //set_mod_vertex(point);
                    }
                }
            },
        },   
            r('planeGeometry', {args:[10000, 10000]}),
            r('meshBasicMaterial', {color:'white', toneMapped:false}),
            r(Product, {ref:product, mod_vertex:mod_vertex, mod_verts:mod_verts, selection:selection, ...p}), 
            r(Line, {ref:draw_line, selection:'off', ...p}), // temp drawing line for visualization
        )
    )
}

function Base(){
    const [act,set_act] = useState({name:''});
    return (r(Fragment,{},
        r(Main_Navbar),
        r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
            r(Canvas,{orthographic: true, camera:{position:[0, 0, 100]}, onCreated:(state)=>raycaster=state.raycaster},
                r(StrictMode,{},
                    r(Camera_Control_2D),
                    r(Board, {base:{act:act,set_act:set_act}}), 
                )
            )
        ),
        r(Toolbar, {set_act:set_act}),
    ))
}

createRoot(document.getElementById('app')).render(r(StrictMode,{},r(Base)));