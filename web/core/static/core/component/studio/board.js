import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {useThree, useFrame} from '@react-three/fiber';
import {Vector3} from 'three';
import {ss, rs, useS} from '../../app.js';

//const pointer_start = new Vector2();
//const pointer_vect = new Vector2();
// const draw_verts = [];
//var pointers_down = 0;
//var dragging = false;

const tv = new Vector3();

// function round(v){
//     return Math.round((v + Number.EPSILON) * 100)/100
// }

// const pos=e=> { // need to project to plane in front of camera so works with different camera tilts ?!?!?!?!
//     const p = e.intersections[e.intersections.length-1].point;
//     return tv.set(round(p.x), round(p.y), 0); //tv.set(p.x, p.y, 0); //tv.set(Math.round(p.x),Math.round(p.y),0); 
// }// could just be e.intersections[0].point?
//const name=(e)=>   e.intersections[0].object.name
//const select=(e)=> e.intersections[0];


export function Board(){
    const obj = useRef();
    const {camera} = useThree(); 
    //const camera_controls = useRef();
    //const [dragging, set_dragging] = useState();
    //const board = useRef();
    //const draw_line = useRef();
    ////const studio_mode = useS(d=> d.studio.mode);
    ////const design_mode = useS(d=> d.design.mode);
    //const pointers = useS(d=> d.board.pointers);
    //const selection = useReactiveVar(selection_rv);
    ////////useFrame(()=>raycaster.params.Points.threshold = 10/camera.zoom); < ----- needed for point clicking!
    //useFrame(()=>{
    //    camera_zoom_rv(camera.zoom);
    //});

    useEffect(()=>{
        camera.add(obj.current);
    },[]);

    //console.log('board render');
    return (
        c('mesh', { 
            ref: obj,
            name: 'board',
            position:[0,0,-2000],
            onClick(e){
                e.stopPropagation();
                ss(d=>{
                    if(!d.studio.gizmo_active && e.delta < d.max_click_delta){
                            //const p = point(e);
                            // // // if(studio_mode=='design'){
                            // // //     if(design_mode=='draw'){
                            // // //         d.design.make_point(d, pos(e));
                            // // //         //ss(d=> d.design.make_point(d, pos(e)));  //{x:p.x, y:p.y, z:0}
                            // // //         return
                            // // //     }
                            // // // }
                            d.pick.none(d);
                            //ss(d=> d.pick.none(d));
                            //if(mode=='graph') 
                            //if(name(e) == 'board') selection_rv(null);
                            //if(draw_mode == 'erase' && name(e) == 'points')
                                //project.current.mutate({selection:select(e), record:true});
                            //if(draw_mode == 'draw' && name(e) == 'meshline') //if(event.delta < 5 && event.intersections[0].object.name != 'endpoints'){
                            //    selection_rv(select(e));
                    }
                    d.studio.gizmo_active = false;
                });
                
            },
            // onPointerUp(e){
            //     if(e.which==3){//[0,1].includes(e.which)){
            //         ss(d=>{ d.studio.gizmo_active = false; });
            //     }
            // },

            // onPointerDown:e=>{
            //     if([0,1].includes(e.which)){
            //         ssl(d=>{
            //             d.board.pin_pos = new Vector3().copy(pos(e));
            //             d.board.pointers++;}
            //         );
            //     }
            // },
            // onPointerUp:e=>{
            //     if([0,1].includes(e.which)){
            //         ssl(d=>{ 
            //             d.board.pointers--;
            //             if(d.board.pointers < 0) d.board.pointers = 0;
            //         });
            //     }
            // },
            // onPointerMove:e=>{
            //     ssl(d=>{ 
            //         d.board.drag(d, pos(e));
            //     });
            // },
            // onPointerLeave:e=> { 
            //     if(e.intersections.length < 1) {
            //         ss(d=>{
            //             d.board.pointers = 0;
            //             d.board.stop_dragging(d);
            //         });
            //     }
            // },

            // onPointerLeave:(e)=> { 
            //     if(e.intersections.length < 1) {
            //         pointers_down = 0;//{zero_pointers_down_on_enter = true;  console.log('zero_pointers_down_on_enter');}
            //         //draw_verts.length = 0;
            //         //draw_line.current.set_verts(new Float32Array());
            //         set_dragging(false);
            //     }
            // },
            // onPointerDown:(e)=>{ e.stopPropagation();
            //     if([0,1].includes(e.which)){
            //         pointers_down++;
            //         pointer_start.set(e.clientX,e.clientY);
            //         if(!(selection && selection.object.name == 'meshline')){ // if no line selected 
            //             if(draw_mode == 'add'){
            //                 if(name(e) == 'meshline'){
            //                     //project.current.mutate({selection:select(e), new_point:point(e), record:false});
            //                     set_dragging(true);
            //                 }
            //             }
            //             if(['endpoints','points'].includes(name(e))){
            //                 selection_rv(select(e));
            //                 set_dragging(true);
            //             }
            //         }
            //     }
            // },
            // onPointerUp:(e)=>{ e.stopPropagation();
            //     if([0,1].includes(e.which)){ // touch or left mouse button? (not sure about 0 and 1)
            //         if(selection){ 
            //             if(pointers_down==1 && (draw_verts.length>0 || dragging)){
            //                 // project.current.mutate({
            //                 //     selection: selection,
            //                 //     draw_verts: new Float32Array(draw_verts),
            //                 //     move_point: point(e),
            //                 //     record: true,
            //                 // });
            //             }
            //             draw_verts.length = 0;
            //             draw_line.current.set_verts(new Float32Array());
            //         }
            //         set_dragging(false);
            //         pointers_down--;
            //         if(pointers_down < 0) pointers_down = 0;
            //     }
            // }, 
            // onPointerMove:(e)=>{ 
            //     e.stopPropagation();
            //     if(pointers_down==1 && selection){ 
            //         if(selection.object.name == 'meshline'){
            //             pointer_vect.set(e.clientX,e.clientY);
            //             if(pointer_start.distanceTo(pointer_vect) > 2){
            //                 draw_verts.push(point(e).x, point(e).y, 0); // will need to find other z value for 3d lines
            //                 draw_line.current.set_verts(new Float32Array(draw_verts));
            //             }
            //         }
            //         if(dragging){
            //             //project.current.mutate({selection:selection, move_point:point(e), record:false});
            //         }
            //     }
            // },
        },   
            c('planeGeometry', {args:[20000, 20000],}),
            c('meshBasicMaterial', {color:'white', toneMapped:false}),
        )
    )
}


//export const camera_zoom_rv = makeVar(1);
// const update_camera_zoom=()=> {console.log('camera changed!'); camera_zoom_rv(camera.zoom);}
//     useEffect(() => {
//         camera_controls.current.addEventListener('change', update_camera_zoom);
//         return () => camera_controls.current.removeEventListener('change', update_camera_zoom);
//     },[]) // <-- only run after initial render