import {createElement as r, useRef, useState, useEffect, Fragment, useImperativeHandle, forwardRef} from 'react';
import {Canvas, useThree, useFrame} from 'r3f';
import {Vector2} from 'three';
import {Product} from './product.js';
import {Line} from './line.js';
import {Toolbar} from './toolbar.js';
import {CameraControls} from 'drei';
import {useParams} from 'rrd';
import {makeVar, useReactiveVar} from 'apollo';
import {use_query} from '../app.js';

export const editor_act_rv = makeVar({name:'none'});
export const editor_qr_rv = makeVar();
export const show_points_rv = makeVar(true);
export const show_endpoints_rv = makeVar(true);
export const draw_mode_rv = makeVar('draw');
export const product_rv = makeVar();
export const selection_rv = makeVar();

const pointer_start = new Vector2();
const pointer_vect = new Vector2();
const draw_verts = [];
var pointers_down = 0;
const point=(e)=>  e.intersections[e.intersections.length-1].point;
const name=(e)=>   e.intersections[0].object.name
const select=(e)=> e.intersections[0];

//export const View_2D = forwardRef( 
function View_2D(p) {
    const {camera, raycaster} = useThree(); 
    //const camera_controls = useRef();
    //const [selection, set_selection] = useState(); //{object:{name:'none'}}
    const [dragging, set_dragging] = useState();
    const product = useRef();
    const draw_line = useRef();
    const draw_mode = useReactiveVar(draw_mode_rv);
    const selection = useReactiveVar(selection_rv);

    useFrame(()=>raycaster.params.Points.threshold = 11/camera.zoom);

    return (
        r('mesh', { 
            name: 'board',
            onClick:(e)=>{ e.stopPropagation();
                if(e.delta < 5){
                    if(name(e) == 'board') selection_rv(null);
                    if(draw_mode == 'delete' && name(e) == 'points')
                        product.current.mutate({selection:select(e), record:true});
                    if(draw_mode == 'draw' && name(e) == 'meshline') //if(event.delta < 5 && event.intersections[0].object.name != 'endpoints'){
                        selection_rv(select(e));
                }
            },
            onPointerLeave:(e)=> { 
                if(e.intersections.length < 1) {
                    pointers_down = 0;//{zero_pointers_down_on_enter = true;  console.log('zero_pointers_down_on_enter');}
                    draw_verts.length = 0;
                    draw_line.current.set_verts(new Float32Array());
                    set_dragging(false);
                }
            },
            onPointerDown:(e)=>{ e.stopPropagation();
                if([0,1].includes(e.which)){
                    pointers_down++;
                    pointer_start.set(e.clientX,e.clientY);
                    if(!(selection && selection.object.name == 'meshline')){ // if no line selected 
                        if(draw_mode == 'add'){
                            if(name(e) == 'meshline'){
                                product.current.mutate({selection:select(e), new_point:point(e), record:false});
                                set_dragging(true);
                            }
                        }
                        if(['endpoints','points'].includes(name(e))){
                            selection_rv(select(e));
                            set_dragging(true);
                        }
                    }
                }
            },
            onPointerUp:(e)=>{ e.stopPropagation();
                if([0,1].includes(e.which)){ // touch or left mouse button? (not sure about 0 and 1)
                    if(selection){ 
                        if(pointers_down==1 && (draw_verts.length>0 || dragging)){
                            product.current.mutate({
                                selection: selection,
                                draw_verts: new Float32Array(draw_verts),
                                move_point: point(e),
                                record: true,
                            });
                        }
                        draw_verts.length = 0;
                        draw_line.current.set_verts(new Float32Array());
                    }
                    set_dragging(false);
                    pointers_down--;
                    if(pointers_down < 0) pointers_down = 0;
                }
            }, 
            onPointerMove:(e)=>{ e.stopPropagation();
                if(pointers_down==1 && selection){ 
                    if(selection.object.name == 'meshline'){
                        pointer_vect.set(e.clientX,e.clientY);
                        if(pointer_start.distanceTo(pointer_vect) > 2){
                            draw_verts.push(point(e).x, point(e).y, 0); // will need to find other z value for 3d lines
                            draw_line.current.set_verts(new Float32Array(draw_verts));
                        }
                    }
                    if(dragging){
                        product.current.mutate({selection:selection, move_point:point(e), record:false});
                    }
                }
            },
        },   
            r('planeGeometry', {args:[10000, 10000]}),
            r('meshBasicMaterial', {color:'white', toneMapped:false}),
            r(Product, {ref:rf=>{product_rv(rf); product.current=rf}}),  
            r(Line, {ref:draw_line}), // temp drawing line for visualization
        )
    )
};

export function Studio_Editor(){
    const {id} = useParams(); // from react router
    const [data, alt] = use_query('GetProduct',[
        ['product id name story file public owner{id firstName}', ['String! id', id]], ['user id'],
    ], 'no-cache', editor_qr_rv); 
    return (
        alt ? r(alt) : 
            r(Fragment,{},
                r(Toolbar),//, {product:data.product, user:data.user}), //, view_2d:view_2d
                r('div', {name:'r3f', className:'position-absolute start-0 end-0 top-0 bottom-0', style:{zIndex: -1}},
                    r(Canvas,{orthographic:true, camera:{position:[0, 0, 100]}}, //, onCreated:(state)=>raycaster=state.raycaster 
                        r(CameraControls, {
                            makeDefault: true,
                            minDistance: 100, 
                            maxDistance: 100, 
                            polarRotateSpeed: 0, 
                            azimuthRotateSpeed: 0, 
                            draggingSmoothTime: 0,
                        }), 
                        r(View_2D),
                    )
                ),
            )
    )
}