import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {useThree, useFrame} from '@react-three/fiber';
import {Vector3} from 'three';
import {ss, ssp, useS} from '../../app.js';

//const pointer_start = new Vector2();
//const pointer_vect = new Vector2();
// const draw_verts = [];
//var pointers_down = 0;

const tv = new Vector3();

const point=e=> {
    const p = e.intersections[e.intersections.length-1].point;
    return tv.set(Math.round(p.x),Math.round(p.y),0); 
}// could just be e.intersections[0].point?
//const name=(e)=>   e.intersections[0].object.name
//const select=(e)=> e.intersections[0];


export function Board(){
    //const {camera, raycaster} = useThree(); 
    //const camera_controls = useRef();
    //const [dragging, set_dragging] = useState();
    //const board = useRef();
    //const draw_line = useRef();
    const mode = useS(d=> d.studio.mode);
    const draw_mode = useS(d=> d.draw.mode);
    //const selection = useReactiveVar(selection_rv);
    ////////useFrame(()=>raycaster.params.Points.threshold = 10/camera.zoom); < ----- needed for point clicking!
    //useFrame(()=>{
    //    camera_zoom_rv(camera.zoom);
    //});
    return (
        c('mesh', { 
            name: 'board',
            position:[0,0,-400],
            onClick:e=>{e.stopPropagation();
                if(e.delta < 5){
                    const p = point(e);
                    if(mode=='design'){
                        if(draw_mode=='draw'){
                            ssp(d=> d.draw.point(d, {x:p.x, y:p.y, z:0}));
                            return
                        }
                    }
                    ss(d=> d.pick.none(d));
                    //if(mode=='graph') 
                    //if(name(e) == 'board') selection_rv(null);
                    //if(draw_mode == 'erase' && name(e) == 'points')
                        //project.current.mutate({selection:select(e), record:true});
                    //if(draw_mode == 'draw' && name(e) == 'meshline') //if(event.delta < 5 && event.intersections[0].object.name != 'endpoints'){
                    //    selection_rv(select(e));
                }
            },
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
            c('planeGeometry', {args:[10000, 10000],}),
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