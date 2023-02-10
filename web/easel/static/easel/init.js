import ReactDOM from 'react_dom'; 
import {createElement as r, useState} from 'react';
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
    const [draw_verts, set_draw_verts] = useState([]);
    const [mod_verts, set_mod_verts] = useState();
    const [mod_vertex, set_mod_vertex] = useState();
    const [selection, set_selection] = useState();
    useFrame(()=>raycaster.params.Points.threshold = 12/camera.zoom);
    return (
        r('mesh', { 
            name: 'board',
            onClick:(event)=>{
                event.stopPropagation();
                if(event.delta < 3){
                    set_selection(event.intersections[0]);
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
                    //if(record){
                        //p.base.set_act({name:'record'});
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
                            set_draw_verts(new Float32Array(new_verts));
                        }
                    }else if(selection.object.name == 'vertex'){
                        set_mod_vertex(point);
                    }
                }
            },
        },[   
            r('planeGeometry', {args:[10000, 10000]}),
            r('meshBasicMaterial', {color:'white', toneMapped:false}),
            r(Product, {mod_verts:mod_verts, mod_vertex:mod_vertex, selection:selection, ...p}),
            r(Line, {verts:draw_verts, selection:'off', ...p}), // temp drawing line for visualization
        ])
    )
}

function Base(){
    const [act,set_act] = useState({name:''});
    return ([
        r(Main_Navbar),
        r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
            r(Canvas,{orthographic: true, camera:{position:[0, 0, 100]}, onCreated:(state)=>raycaster=state.raycaster},[
                r(Camera_Control_2D),
                r(Board, {base:{act:act,set_act:set_act}}),
            ])
        ),
        r(Toolbar, {set_act:set_act}),
    ])
}

ReactDOM.createRoot(document.getElementById('app')).render(r(Base));