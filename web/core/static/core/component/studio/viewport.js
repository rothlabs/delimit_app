import {createElement as c, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {CameraControls} from '@react-three/drei/CameraControls';
import {Graph} from '../graph/graph.js';
import {Board} from './board.js';
import {Part} from '../part/part.js';
import {Mover} from './mover.js';
import {useS, ss, Fixed_Size_Group, theme, gs} from '../../app.js';
import {useThree, useFrame} from '@react-three/fiber';
import {Selection_Box} from '../selection/selection_box.js'; // selection box

// const pointer_start = new Vector2();
// const pointer_vect = new Vector2();
// const draw_verts = [];
// var pointers_down = 0;
// const point=(e)=>  e.intersections[e.intersections.length-1].point;
// const name=(e)=>   e.intersections[0].object.name
// const select=(e)=> e.intersections[0];

function Viewport_Control(){
    const camera_controls = useRef();
    const pick_box = useS(d=> d.pick.box);
    const {camera} = useThree(); 
    useEffect(()=>ss(d=>{
        d.camera_controls = camera_controls.current;
        d.camera_controls.addEventListener('control', ()=>ss(d=>{ // need to remove listener ?!?!?!?!
            if(d.studio.mode=='graph' && d.design.part){
                d.graph.c_c = {
                    azimuth: d.camera_controls.azimuthAngle,
                    polar: d.camera_controls.polarAngle,
                    pos: d.camera_controls.getTarget(),
                    zoom: camera.zoom,
                };
            }else if(d.studio.mode=='design'){
                d.n[d.design.part].c_c = {
                    azimuth: d.camera_controls.azimuthAngle,
                    polar: d.camera_controls.polarAngle,
                    pos: d.camera_controls.getTarget(),
                    zoom: camera.zoom,
                };
            }
        }));
    }),[camera_controls]);
    return(c('group', {name:'viewport_parts'}, 
        c(CameraControls, {
            ref: camera_controls,
            makeDefault: true,
            minDistance: 1000, 
            maxDistance: 1000, 
            polarRotateSpeed: (pick_box ? 0 : 1), 
            azimuthRotateSpeed: (pick_box ? 0 : 1), 
            draggingSmoothTime: 0,
        }), 
        pick_box && c(Selection_Box, { // studio mode causes this to render and removes selection!!!!!!!
            style:{
                border: "1px dashed #d6006a", // backgroundColor: "rgba(75, 160, 255, 0.3)",
                position: "fixed",
            },
            onSelectionChanged:objs=>ss(d=>{ // key pressing making this fire ?!?!?!?! wtf
                if(!d.pick.multi) d.pick.none(d);
                const nodes = [];
                objs.forEach(obj=>{
                    const pickable = obj.parent?.__r3f.memoizedProps.pickable;
                    if(pickable) nodes.push(pickable);
                });
                d.pick.set(d, nodes, true);
            }),
        }),
    ))
}

export function Viewport(){
    const light = useRef();
    const {scene, camera, raycaster} = useThree(); 
    useFrame(()=>raycaster.params.Points.threshold = 12/camera.zoom); //< ----- needed for point clicking!
    //const camera_controls = useRef();
    //const [dragging, set_dragging] = useState();
    //const board = useRef();
    //const draw_line = useRef();
    //const draw_mode = useReactiveVar(draw_mode_rv);
    //const selection = useReactiveVar(selection_rv);
    //useFrame(()=>{
    //    camera_zoom_rv(camera.zoom);
    //});
    const studio_mode = useS(d=> d.studio.mode);

    useEffect(()=>{
        const d = gs();
        if(d.camera_controls){
            var cc = null;
            if(studio_mode=='graph'){ cc = d.graph.c_c }
            else if(studio_mode=='design'){ cc = d.n[d.design.part].c_c }
            if(cc){
                d.camera_controls.rotateTo(cc.azimuth, cc.polar);
                d.camera_controls.moveTo(cc.pos.x, cc.pos.y, cc.pos.z);
                d.camera_controls.zoomTo(cc.zoom);
            }else{
                d.camera_controls.rotateTo(0,Math.PI/2);
                d.camera_controls.moveTo(0,0,0);
                d.camera_controls.zoomTo(1);
            }
            d.camera_controls.dollyTo(1000);
        }
    },[studio_mode]);

    useEffect(()=>{
        scene.add(camera);
        camera.add(light.current);
    },[]);

    //console.log('viewport Render!');
    return (
        c('group', {name:'viewport'}, 
            c(Viewport_Control),
            studio_mode=='graph'  && c(Graph),
            studio_mode=='design' && c(Part),
            c(Board),
            c(Mover),
            c(Fixed_Size_Group, {size:12,},
                c('mesh', {scale:1, rotation:[0,0,0], position:[0,0,0]},
                    c('boxGeometry'),
                    c('meshStandardMaterial', {color:'grey'}), //, toneMapped:false
                ),
            ),
            c('directionalLight', { 
                ref:light,
                color: 'white',
                intensity: 0.75,
                position: [0,0,1000],
            }),
            c('ambientLight', {
               color: 'white',
               intensity: 0.25,
            }),
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