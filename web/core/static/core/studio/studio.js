import {createElement as r, useRef, useState, Fragment} from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Vector2,Vector3} from 'three';
import {Product} from './product.js';
import {Line} from './line.js';
import {History_Control} from './history.js';
import {CameraControls} from 'drei';
import {useParams} from 'rrd';
import {useQuery, gql} from 'apollo';
import {Loading, Error_Page} from '../feedback.js';
import {makeVar} from 'apollo';
//import { create } from 'zustand'

//export const useStore = create((set, get) => ({
//  page: 'Easel',
  //set_page:()=>
//}))
export const history_act_var = makeVar({name:'none'});

const pointer_start = new Vector2();
const pointer_vect = new Vector2();
const new_verts = [];
var pointers_down = 0;
var raycaster=null;
//var zero_pointers_down_on_enter = false;

function Board(p) {
    const {camera} = useThree(); 
    const [selection, set_selection] = useState();
    const product = useRef();
    const draw_line = useRef();
    useFrame(()=>raycaster.params.Points.threshold = 12/camera.zoom);
    return (
        r('mesh', { 
            name: 'board',
            onClick:(event)=>{
                event.stopPropagation();
                if(event.delta < 3 && event.intersections[0].object.name != 'endpoint'){
                    set_selection(event.intersections[0]);
                }
            },
            //onPointerEnter:(event)=> {
            //    if(zero_pointers_down_on_enter){pointers_down = 0; zero_pointers_down_on_enter=false;}
            //},
            onPointerLeave:(event)=> { 
                if(event.intersections.length < 1) {
                    pointers_down = 0;//{zero_pointers_down_on_enter = true;  console.log('zero_pointers_down_on_enter');}
                    new_verts.length = 0;
                    draw_line.current.set_verts(new Float32Array());
                    set_selection(null);
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
                    if(selection){ 
                        if(pointers_down==1){
                            product.current.set_mod({
                                verts: new Float32Array(new_verts),
                                endpoint: event.intersections[event.intersections.length-1].point,
                            });
                        }
                        new_verts.length = 0;
                        draw_line.current.set_verts(new Float32Array());
                        if(selection.object.name == 'endpoint'){
                            set_selection(null); 
                        }
                    }
                    pointers_down--;
                    if(pointers_down < 0) pointers_down = 0;
                }
            }, 
            onPointerMove:(event)=>{
                event.stopPropagation();
                if(pointers_down==1 && selection){ 
                    const point = event.intersections[event.intersections.length-1].point;
                    if(selection.object.name == 'line'){
                        pointer_vect.set(event.clientX,event.clientY);
                        if(pointer_start.distanceTo(pointer_vect) > 2){
                            new_verts.push(point.x,point.y,0); // will need to find other z value for 3d lines
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
            r(Line, {ref:draw_line, selection:'off', verts:[], name:'draw_line', ...p}), // temp drawing line for visualization
        )
    )
}


//add light and cube to check if camera is orthographic like it should be 
export function Studio(){
    const {productID} = useParams();
    const {loading, error, data} = useQuery(gql`query Product($id: String!){  
        product(id: $id) {
            file
        }
    }`,{variables:{id:productID}});
    const camera_controls = useRef();
    if (loading) return r(Loading);
    if (error)   return r(Error_Page);
    return (r(Fragment,{},
        r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
            r(Canvas,{orthographic: true, camera:{position:[0, 0, 900]}, onCreated:(state)=>raycaster=state.raycaster}, 
                r(CameraControls, {ref:camera_controls, polarRotateSpeed:0, azimuthRotateSpeed:0, draggingSmoothTime:0}), //camera:THREE.Orthographic
                r(Board,{camera_controls:camera_controls, file:data.product.file}), 
            )
        ),
        r(History_Control), 
    ))
}
