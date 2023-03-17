import {createElement as r, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {MeshLineRaycast } from './meshline.js';
import {useThree, useFrame} from 'r3f';
import {theme} from '../app.js';
import {history_action} from './editor.js';
import {useReactiveVar} from 'apollo';
import * as vtx from './vertex.js';
import * as THREE from 'three';

//SET OBJECT Z INSTEAD OF VERTEX Z FOR PROPER RENDERING ORDER ///////////////////////////
//Maybe does not apply to mesh line and points, appears to be okay 

export const Line = forwardRef(function Line(p, ref) {
    const mesh = useRef();
    const export_mesh = useRef();
    const meshline = useRef();
    const endpoint = useRef();
    const endpoint_attr_pos = useRef();
    const endpoint_attr_color = useRef();
    const material = useRef();
    const {camera} = useThree();
    const [selected, set_selected] = useState(false);
    const [selected_point, set_selected_point] = useState(-1);
    const [constraints, set_constraints] = useState([]);//[{enforce:()=>{},wow:'wow'}]);
    const history_act = useReactiveVar(history_action);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    const name=()=> p.node.name;
    const verts=()=> meshline.current.positions;//vtx.remove_doubles(meshline.current.positions);
    const vect=(i)=> vtx.vect(meshline.current.positions,i);
    const prev_verts=()=> history.verts[history.index];
    const prev_vect=(i)=> vtx.vect(history.verts[history.index],i);

    function endpoint_verts(){
        if(endpoint_attr_pos.current) endpoint_attr_pos.current.needsUpdate = true;
        if(meshline.current) return vtx.endpoints(meshline.current.positions);//, (selected_point==0)?30:20, (selected_point==1)?30:20);
        return new Float32Array([0,0,0,0,0,0]);
    }

    function endpoint_colors(){
        if(endpoint_attr_color.current) endpoint_attr_color.current.needsUpdate = true;
        return (new Float32Array([...(selected_point==0)?theme.primary:theme.secondary, ...(selected_point==1)?theme.primary:theme.secondary]));
    }

    function update(args){
        meshline.current.setPoints(args.verts);
        export_mesh.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(args.verts, 3 ) );
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
        set_verts:(vts)=> meshline.current.setPoints(vts),
        set_endpoint(new_endpoint){
            if(selected_point == 0) update({verts:vtx.map(prev_verts(), new_endpoint, vtx.vect(prev_verts(),-1)), constrain:true});
            if(selected_point == 1) update({verts:vtx.map(prev_verts(), vtx.vect(prev_verts(),0), new_endpoint), constrain:true});
        },
        set_mod(args){
            if(selected && args.verts.length > 4){
                const closest =     vtx.closest_to_endpoints(verts(), args.verts);
                const new_verts_1 = vtx.map(args.verts, closest.v1, closest.v2);
                const new_verts_2 = vtx.replace(verts(), closest.i1, closest.i2, new_verts_1);
                update({verts: new_verts_2, constrain:true, record:true});
            }
            if(selected_point == 0){
                const new_verts = vtx.map(prev_verts(), args.endpoint, vtx.vect(prev_verts(),-1)); //[draw.point.x,draw.point.y,0]
                update({verts:new_verts, constrain:true, record:true});
            }else if(selected_point == 1){
                const new_verts = vtx.map(prev_verts(), vtx.vect(prev_verts(),0), args.endpoint); //vtx.first(line.prev_verts())
                update({verts:new_verts, constrain:true, record:true});
            }
        },
        add_constraint(constraint){
            set_constraints((c)=> [...c, constraint]);
        },
    }));

    useFrame(()=> {
        material.current.lineWidth = 4 / camera.zoom;
    }); 

    useEffect(()=>{
        set_selected(false); 
        set_selected_point(-1); 
        if(p.selection){
            if(p.selection.object == mesh.current) set_selected(true);
            if(p.selection.object == endpoint.current) set_selected_point(p.selection.index);
        }
    },[p.selection]);

    useEffect(()=>{ // Switch to imparitive handler, or add prop that makes it rerender (no the prop was the old way)
        if(p.selection!='off'){
            if(history_act.name == 'record'){
                //console.log(history);
                //console.log('record');
                //if(history.index > -1) 
                history.verts.splice(history.index+1); //history.verts.splice(history.index);
                //console.log(verts().length);
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
            }//else if(history_act.name == 'revert'){
                //if(verts().length > 1){
            //        history.index = 0;
            //        update({verts:history.verts[history.index]}); 
                //}
                //history.index = 0;
            //}
            set_history(history);
            //history_action({name:'none'});
            console.log(history);
        }
    },[history_act]); 

    
    return (
        r('mesh', {
            ref: mesh,
            name: 'line',
            position: p.node? [p.node.position.x,p.node.position.y,p.node.position.z] : [0,0,0],
            raycast: (p.selection!='off') ? MeshLineRaycast : undefined,
        },
            r('meshLine', {ref:meshline, attach:'geometry', points:p.verts, name:p.name}),
            r('meshLineMaterial', {ref:material, color:selected?theme.primary_s:theme.secondary_s}),
            (p.verts.length<6 || p.selection=='off' || p.node.name.includes('v__rim') || p.node.name.includes('v__base') || p.node.name.includes('__out__')) ? null :
                r('points',{ref:endpoint, name:'endpoint', position:[0,0,10]}, //,onPointerUp:(event)=>{console.log('endpoint up');}
                    r('bufferGeometry',{},
                        r('sphere',{attach:'boundingSphere', radius:10000}),
                        r('bufferAttribute',{ref:endpoint_attr_pos, attach: 'attributes-position', count:2, itemSize:3, array:endpoint_verts()}), 
                        r('bufferAttribute',{ref:endpoint_attr_color, attach:'attributes-color', count:2, itemSize:3, array:endpoint_colors()}),
                    ),
                    r('pointsMaterial',{size:12, vertexColors:true, map:p.point_texture, alphaTest:.5, transparent:true}),
                ),
                p.node && r('mesh', { // For export
                    ref: export_mesh,
                    name: p.node.name, 
                    position: [p.node.position.x,p.node.position.y,p.node.position.z],
                    geometry: p.node.geometry,
                },
            ),
        )
    )
});


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