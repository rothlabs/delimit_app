import {createElement as r, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {useThree, useFrame} from 'r3f';
import {Vector2} from 'three';
//import {Project} from './project.js';
//import {Line} from './line.js';
import {CameraControls} from 'drei';
import { Graph } from './graph/graph.js';

// const pointer_start = new Vector2();
// const pointer_vect = new Vector2();
// const draw_verts = [];
// var pointers_down = 0;
// const point=(e)=>  e.intersections[e.intersections.length-1].point;
// const name=(e)=>   e.intersections[0].object.name
// const select=(e)=> e.intersections[0];


export function Viewport(){
    //const {camera, raycaster} = useThree(); 
    //const camera_controls = useRef();
    //const [dragging, set_dragging] = useState();
    //const board = useRef();
    //const draw_line = useRef();
    //const draw_mode = useReactiveVar(draw_mode_rv);
    //const selection = useReactiveVar(selection_rv);
    ////////useFrame(()=>raycaster.params.Points.threshold = 10/camera.zoom); < ----- needed for point clicking!
    //useFrame(()=>{
    //    camera_zoom_rv(camera.zoom);
    //});
    return (
        r('group', {name:'viewport'}, 
            r(CameraControls, { //ref: camera_controls,
                makeDefault: true,
                minDistance: 1000, 
                maxDistance: 1000, 
                polarRotateSpeed: 0, 
                azimuthRotateSpeed: 0, 
                draggingSmoothTime: 0,
            }), 
            r(Graph),
            // r('ambientLight', {
            //     color: 'white',
            //     intensity: 0.5,
            // }),
            // r('directionalLight', { 
            //     color: 'white',
            //     intensity: 0.5,
            //     position: [2,2,1],
            // }),
            // r('mesh', { 
            //     name: 'board',
            //     onClick:(e)=>{ e.stopPropagation();
            //         if(e.delta < 5){
            //             if(name(e) == 'board') selection_rv(null);
            //             if(draw_mode == 'delete' && name(e) == 'points')
            //                 //project.current.mutate({selection:select(e), record:true});
            //             if(draw_mode == 'draw' && name(e) == 'meshline') //if(event.delta < 5 && event.intersections[0].object.name != 'endpoints'){
            //                 selection_rv(select(e));
            //         }
            //     },
            //     onPointerLeave:(e)=> { 
            //         if(e.intersections.length < 1) {
            //             pointers_down = 0;//{zero_pointers_down_on_enter = true;  console.log('zero_pointers_down_on_enter');}
            //             draw_verts.length = 0;
            //             draw_line.current.set_verts(new Float32Array());
            //             set_dragging(false);
            //         }
            //     },
            //     onPointerDown:(e)=>{ e.stopPropagation();
            //         if([0,1].includes(e.which)){
            //             pointers_down++;
            //             pointer_start.set(e.clientX,e.clientY);
            //             if(!(selection && selection.object.name == 'meshline')){ // if no line selected 
            //                 if(draw_mode == 'add'){
            //                     if(name(e) == 'meshline'){
            //                         //project.current.mutate({selection:select(e), new_point:point(e), record:false});
            //                         set_dragging(true);
            //                     }
            //                 }
            //                 if(['endpoints','points'].includes(name(e))){
            //                     selection_rv(select(e));
            //                     set_dragging(true);
            //                 }
            //             }
            //         }
            //     },
            //     onPointerUp:(e)=>{ e.stopPropagation();
            //         if([0,1].includes(e.which)){ // touch or left mouse button? (not sure about 0 and 1)
            //             if(selection){ 
            //                 if(pointers_down==1 && (draw_verts.length>0 || dragging)){
            //                     // project.current.mutate({
            //                     //     selection: selection,
            //                     //     draw_verts: new Float32Array(draw_verts),
            //                     //     move_point: point(e),
            //                     //     record: true,
            //                     // });
            //                 }
            //                 draw_verts.length = 0;
            //                 draw_line.current.set_verts(new Float32Array());
            //             }
            //             set_dragging(false);
            //             pointers_down--;
            //             if(pointers_down < 0) pointers_down = 0;
            //         }
            //     }, 
            //     onPointerMove:(e)=>{ 
            //         e.stopPropagation();
            //         if(pointers_down==1 && selection){ 
            //             if(selection.object.name == 'meshline'){
            //                 pointer_vect.set(e.clientX,e.clientY);
            //                 if(pointer_start.distanceTo(pointer_vect) > 2){
            //                     draw_verts.push(point(e).x, point(e).y, 0); // will need to find other z value for 3d lines
            //                     draw_line.current.set_verts(new Float32Array(draw_verts));
            //                 }
            //             }
            //             if(dragging){
            //                 //project.current.mutate({selection:selection, move_point:point(e), record:false});
            //             }
            //         }
            //     },
            // },   
            //     r('planeGeometry', {args:[10000, 10000]}),
            //     r('meshBasicMaterial', {color:'white', toneMapped:false}),
            //     //r(Project, {ref:rf=>{project_rv(rf); project.current=rf}}),  
                
            //     r(Line, {ref:draw_line}), // temp drawing line for visualization
            // ),
        )
    )
}


//export const camera_zoom_rv = makeVar(1);
// const update_camera_zoom=()=> {console.log('camera changed!'); camera_zoom_rv(camera.zoom);}
//     useEffect(() => {
//         camera_controls.current.addEventListener('change', update_camera_zoom);
//         return () => camera_controls.current.removeEventListener('change', update_camera_zoom);
//     },[]) // <-- only run after initial render