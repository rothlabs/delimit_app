import {createElement as r, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {MeshLineRaycast } from './meshline.js';
import {useThree, useFrame} from 'r3f';
import {theme, for_child} from '../app.js';
import {history_action} from './editor.js';
import {useReactiveVar} from 'apollo';
import * as vtx from './vertex.js';
import * as THREE from 'three';

//SET OBJECT Z INSTEAD OF VERTEX Z FOR PROPER RENDERING ORDER ///////////////////////////
//Maybe does not apply to mesh line and points, appears to be okay 

const max_points = 100;

export const Line = forwardRef(function Line(p, ref) {
    var source_verts = [];
    for_child(p.source,'points', (child)=> source_verts = child.geometry.attributes.position.array);
    //if(points_child) source_verts = points_child.geometry.attributes.position.array;
    // if(p.source){
    //     p.source.children.forEach(n => {
    //         if(n.name.slice(0,6) == 'points') {
    //             source_verts = n.geometry.attributes.position.array; // second child should be 'points' object
    //         }
    //     });
    // }
    const points = useRef();
    const point_attr_pos = useRef();
    const point_attr_color = useRef();
    const mesh = useRef();
    const meshline = useRef();
    const endpoints = useRef();
    const endpoint_attr_pos = useRef();
    const endpoint_attr_color = useRef();
    const meshline_material = useRef();
    const {camera} = useThree();
    const [selected_line, set_selected_line] = useState(false);
    const [selected_point, set_selected_point] = useState(-1);
    const [selected_endpoint, set_selected_endpoint] = useState(-1);
    const [constraints, set_constraints] = useState([]);//[{enforce:()=>{},wow:'wow'}]);
    const history_act = useReactiveVar(history_action);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    const name=()=> p.source.name;
    const verts=()=> points.current.geometry.attributes.position.array;//meshline.current.positions;//vtx.remove_doubles(meshline.current.positions);
    const vect=(i)=> vtx.vect(points.current.geometry.attributes.position.array,i); //vtx.vect(meshline.current.positions,i);
    const prev_verts=()=> history.verts[history.index];
    const prev_vect=(i)=> vtx.vect(history.verts[history.index],i);

    function point_colors(){
        if(point_attr_color.current) point_attr_color.current.needsUpdate = true;
        const colors = [];
        for(var i=0; i<max_points; i++){
            colors.push(...selected_point==i ? theme.primary : theme.secondary);
        }
        return new Float32Array(colors);
    }

    function endpoint_verts(){
        if(endpoint_attr_pos.current) endpoint_attr_pos.current.needsUpdate = true;
        if(points.current) return vtx.endpoints(points.current.geometry.attributes.position.array);//vtx.endpoints(meshline.current.positions);//, (selected_endpoint==0)?30:20, (selected_endpoint==1)?30:20);
        return new Float32Array([0,0,0,0,0,0]);
    }

    function endpoint_colors(){
        if(endpoint_attr_color.current) endpoint_attr_color.current.needsUpdate = true;
        return new Float32Array([...selected_endpoint==0?theme.primary:theme.secondary, ...selected_endpoint==1?theme.primary:theme.secondary]);
    }

    function update(args){
        const curve = new THREE.CatmullRomCurve3(vtx.vects(args.verts));
        meshline.current.setPoints(curve.getPoints( 100 ));
        points.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(args.verts, 3)); //points.current.geometry.setAttribute('color', new THREE.BufferAttribute(point_colors(args.verts.length), 3));
        if(endpoint_attr_pos.current) endpoint_attr_pos.current.array = endpoint_verts();
        if(args.constrain){
            constraints.forEach(constraint => constraint.enforce());
        }
        if(args.record) history_action({name:'record'});
    }

    useImperativeHandle(ref,()=>({ 
        name:name,
        update:update,//(args)=>update(args, constraints), // need to pass in useState variable in imperative handle for some reason?
        verts:verts,
        vect:vect,
        prev_verts:prev_verts,
        prev_vect:prev_vect,
        set_verts:(vts)=> meshline.current.setPoints(vts), // vtx.reline(vts) for direct line drawing
        set_endpoint(new_endpoint){
            if(selected_endpoint == 0) update({verts:vtx.map(prev_verts(), new_endpoint, vtx.vect(prev_verts(),-1)), constrain:true});
            if(selected_endpoint == 1) update({verts:vtx.map(prev_verts(), vtx.vect(prev_verts(),0), new_endpoint), constrain:true});
        },
        set_point(new_point){
            if(selected_point > -1) {
                const new_verts = Array.from(verts());
                new_verts.splice(selected_point*3, 3, new_point.x, new_point.y, new_point.z);
                update({verts:new_verts});
            }
        },
        set_mod(args){
            if(selected_line && args.verts.length > 5){
                const new_verts_0 = vtx.reline(args.verts);
                const closest     = vtx.closest_to_endpoints(verts(), new_verts_0);
                const new_verts_1 = vtx.map(new_verts_0, closest.v1, closest.v2);
                const new_verts_2 = vtx.replace(verts(), closest.i1, closest.i2, new_verts_1);
                update({verts: new_verts_2, constrain:true, record:true});
            }
            if(selected_endpoint == 0){
                const new_verts = vtx.map(prev_verts(), args.point, vtx.vect(prev_verts(),-1)); //[draw.point.x,draw.point.y,0]
                update({verts:new_verts, constrain:true, record:true});
            }else if(selected_endpoint == 1){
                const new_verts = vtx.map(prev_verts(), vtx.vect(prev_verts(),0), args.point); //vtx.first(line.prev_verts())
                update({verts:new_verts, constrain:true, record:true});
            }
            if(selected_point > -1){
                const new_verts = Array.from(verts());
                new_verts.splice(selected_point*3, 3, args.point.x, args.point.y, args.point.z);
                update({verts:new_verts, record:true});
            }
        },
        add_constraint(constraint){
            set_constraints((c)=> [...c, constraint]);
        },
    }));

    useFrame(()=> {
        //if(meshline_material.current) meshline_material.current.lineWidth = 4 / camera.zoom;
        meshline_material.current.lineWidth = 4 / camera.zoom;
    }); 

    useEffect(()=>{
        set_selected_line(false); 
        set_selected_point(-1); 
        set_selected_endpoint(-1); 
        if(p.selection){
            if(p.selection.object == mesh.current)      set_selected_line(true);
            if(p.selection.object == points.current)    set_selected_point(p.selection.index);
            if(p.selection.object == endpoints.current) set_selected_endpoint(p.selection.index);
        }
    },[p.selection]);

    useEffect(()=>{ // Switch to imparitive handler, or add prop that makes it rerender (no the prop was the old way)
        if(p.selection!='off'){
            if(history_act.name == 'record'){
                history.verts.splice(history.index+1); 
                history.verts.push(verts());
                if(history.verts.length > 10){
                    const original_verts = history.verts.shift();
                    history.verts.shift();
                    history.verts.unshift(original_verts);
                }
                history.index = history.verts.length-1;
            }else if(history_act.name == 'undo'){
                if(history.index > 0){
                    history.index--;
                    update({verts:history.verts[history.index]}); 
                }
            }else if(history_act.name == 'redo'){
                if(history.index < history.verts.length-1){
                    history.index++;
                    update({verts:history.verts[history.index]}); 
                }
            }else if(history_act.name == 'revert'){
                history.index = 0;
                update({verts:history.verts[history.index]}); 
            }
            set_history(history);
        }
    },[history_act]); 


    //console.log(history);
    // on remount, set meshline points
    
    return (
        r('group', {
            name: p.source? p.source.name : 'line',
            position: p.source ? [p.source.position.x,p.source.position.y,p.source.position.z] : [0,0,0],
        }, 
            p.source && r('points', { // source of truth for the line
                ref: points,
                name: 'points',
                position: [0,0,10],//geometry: p.source && p.source.geometry,
            }, 
                r('bufferGeometry',{},
                    r('sphere',{attach:'boundingSphere', radius:10000}),
                    r('bufferAttribute',{ref:point_attr_pos, attach:'attributes-position', count:source_verts.length, itemSize:3, array:source_verts}), 
                    r('bufferAttribute',{ref:point_attr_color, attach:'attributes-color', count:max_points, itemSize:3, array:point_colors()}),//r('bufferAttribute',{ref:point_attr_color, attach:'attributes-color', count:source_verts.length, itemSize:3, array:point_colors(source_verts.length)}),
                ),
                r('pointsMaterial',{size:10, vertexColors:true, map:p.point_texture, alphaTest:.5, transparent:true}),
                //r('pointsMaterial',{visible:false}), 
            ),
            r('mesh', { // for visualization
                ref: mesh,
                name: 'meshline', // give proper ID name that includes "line" or "meshline"
                position: [0,0,0],
                raycast: (p.selection!='off') ? MeshLineRaycast : undefined,
            },
                r('meshLine', {ref:meshline, attach:'geometry', points:source_verts}),
                r('meshLineMaterial', {ref:meshline_material, color:selected_line?theme.primary_s:theme.secondary_s}),
            ),
            !p.source || p.source.name.includes('v__rim') || p.source.name.includes('v__base') || p.source.name.includes('__out__') ? null :
                r('points',{ref:endpoints, name:'endpoints', position:[0,0,20]}, 
                    r('bufferGeometry',{},
                        r('sphere',{attach:'boundingSphere', radius:10000}),
                        r('bufferAttribute',{ref:endpoint_attr_pos, attach: 'attributes-position', count:2, itemSize:3, array:endpoint_verts()}), 
                        r('bufferAttribute',{ref:endpoint_attr_color, attach:'attributes-color', count:2, itemSize:3, array:endpoint_colors()}),
                    ),
                    r('pointsMaterial',{size:15, vertexColors:true, map:p.point_texture, alphaTest:.5, transparent:true}),
                ),
        )
    )
});




//if(p.source) source_verts = p.source.children[1].geometry.attributes.position.array; 


//(source_verts.length<6 || p.selection=='off' || p.source.name.includes('v__rim') || p.source.name.includes('v__base') || p.source.name.includes('__out__')) ? null :

//const history_i = useReactiveVar(history_index);
    //const [history, set_history] = useState([]);

        //var count = source_verts.length/3;
        //if(points.current) {
        //    count = points.current.geometry.attributes.position.count;//.array.length;
        //    console.log(count);
        //}

//raycast: undefined,
            //drawRange: {start:0, count:0},
            //visible: false, make material.visible:false instead

//r('bufferAttribute',{attach:'index', count:source_verts.length, itemSize:1, array:new Uint16Array(source_verts.length).fill(0)}), 
            //r('bufferGeometry',{},
            //    p.source && r('bufferAttribute',{attach: 'attributes-position', count:source_verts.length, itemSize:3, array:source_verts}), 
            //),


//r('bufferGeometry', {},
                //    r('bufferAttribute',{ref:endpoint_attr_pos, attach:'attributes-position', count:p.verts.length, itemSize:3, array:p.verts}), 
                //),

//color:new Color('hsl(0,0%,55%)'),})

// function Line(p) {
//     //const mesh = useRef();
//     //const [vect, set_vect] = useState(new Vector3());
//     //useFrame(() => (console.log(vect)));
//     return r('mesh', {
//         p: p,
//         ref: mesh, 
//         //onPointerMove: (event) => set_vect(event.intersections[0].point),},[ 
//         geometry: new meshline(),
//     },[
//             r('planeGeometry', {args:[10000, 10000]}),
//             r('meshBasicMaterial', {color: 'white', toneMapped:false}),
//     ]);
// }

// export function camera_control_2d(){
//     const { camera, gl } = useThree();
//     useEffect(() => {
//         const meshline = new meshline();

//         return () => {
// 			meshline.dispose();
// 		};
//       },
//       [camera, gl]
//     );
//     return r('mesh', {
//         p: p,
//         ref: mesh, 
//         //onPointerMove: (event) => set_vect(event.intersections[0].point),},[ 
//         },[
//             r('planeGeometry', {args:[10000, 10000]}),
//             r('meshBasicMaterial', {color: 'white', toneMapped:false}),
//     ]);
// }