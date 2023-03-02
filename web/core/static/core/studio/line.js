import {createElement as r, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {MeshLineRaycast } from './meshline.js';
import {useThree, useFrame} from 'r3f';
import {TextureLoader} from 'three';
import {theme} from '../app.js';
import {history_act_var} from './studio.js';
import {useReactiveVar} from 'apollo';
import * as vtx from './vertex.js';

//SET OBJECT Z INSTEAD OF VERTEX Z FOR PROPER RENDERING ORDER ///////////////////////////
//Maybe does not apply to mesh line and points, appears to be okay 

const sprite = new TextureLoader().load('/static/texture/disc.png');

export const Line = forwardRef(function Line(p, ref) {
    const mesh = useRef();
    const meshline = useRef();
    const endpoint = useRef();
    const endpoint_attr_pos = useRef();
    const endpoint_attr_color = useRef();
    const material = useRef();
    const {camera} = useThree();
    const [selected, set_selected] = useState(false);
    const [selected_point, set_selected_point] = useState(-1);
    const [constraints, set_constraints] = useState([]);
    const history_act = useReactiveVar(history_act_var);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    const verts=()=> vtx.reline(meshline.current.positions,1);
    const prev_verts=()=> history.verts[history.index-1];

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
        if(endpoint_attr_pos.current) endpoint_attr_pos.current.array = endpoint_verts();
        if(args.depth > 0){
            constraints.forEach(constraint => constraint.enforce({depth:args.depth}));
        }
        if(args.record) history_act_var({name:'record'});
    }

    useImperativeHandle(ref,()=>({ 
        update:update,
        verts:verts,
        prev_verts:prev_verts,
        set_verts(vts){
            meshline.current.setPoints(vts);
        },
        set_endpoint(new_endpoint){
            if(selected_point == 0) update({verts:vtx.map(prev_verts(), new_endpoint, vtx.vect(prev_verts(),-1)), depth:1});
            if(selected_point == 1) update({verts:vtx.map(prev_verts(), vtx.vect(prev_verts(),0), new_endpoint), depth:1});
        },
        set_mod(args){
            if(selected && args.verts.length>5){
                const closest = vtx.closest_to_endpoints(verts(), args.verts);
                const new_verts_1 = vtx.map(args.verts, closest.v1, closest.v2);
                const new_verts_2 = vtx.replace(verts(), closest.i1, closest.i2, new_verts_1);
                update({verts: new_verts_2, depth:1, record:true});
            }
            if(selected_point == 0){
                const new_verts = vtx.map(prev_verts(), args.endpoint, vtx.vect(prev_verts(),-1)); //[draw.point.x,draw.point.y,0]
                update({verts:new_verts, depth:1, record:true});
            }else if(selected_point == 1){
                const new_verts = vtx.map(prev_verts(), vtx.vect(prev_verts(),0), args.endpoint); //vtx.first(line.prev_verts())
                update({verts:new_verts, depth:1, record:true});
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

    useEffect(()=>{
        if(p.selection!='off'){
            if(history_act.name == 'record'){
                history.verts.splice(history.index);
                history.verts.push(verts());
                if(history.verts.length > 7){
                    history.verts.shift();
                }
                history.index = history.verts.length;
            }else if(history_act.name == 'undo'){
                if(history.index-1 > 0){
                    history.index--;
                    update({verts:history.verts[history.index-1]}); //raw:true
                }
            }else if(history_act.name == 'redo'){
                if(history.index+1 <= history.verts.length){
                    history.index++;
                    update({verts:history.verts[history.index-1]}); //raw:true
                }
            }
            set_history(history);
        }
    },[history_act]); 

    return (
        r('mesh', {
            ref: mesh,
            name: 'line',
            position: p.node? [p.node.position.x,p.node.position.y,p.node.position.z] : [0,0,0],
            raycast: (p.selection!='off') ? MeshLineRaycast : undefined,
        },
            r('meshLine', {attach:'geometry', points:p.verts, ref:meshline, name:p.name}),
            r('meshLineMaterial', {ref:material, color:selected?theme.primary_s:theme.secondary_s}),
            (p.verts.length<6 || p.selection=='off' || p.node.name=='iv__rim' || p.node.name=='iv__base') ? null :
                r('points',{ref:endpoint, name:'endpoint', position:[0,0,10]}, //,onPointerUp:(event)=>{console.log('endpoint up');}
                    r('bufferGeometry',{},
                        r('sphere',{attach:'boundingSphere', radius:10000}),
                        r('bufferAttribute',{ref:endpoint_attr_pos, attach: 'attributes-position', count:2, itemSize:3, array:endpoint_verts()}), 
                        r('bufferAttribute',{ref:endpoint_attr_color, attach:'attributes-color', count:2, itemSize:3, array:endpoint_colors()}),
                    ),
                    r('pointsMaterial',{size:12, vertexColors:true, map:sprite, alphaTest:.5, transparent:true}),
                ),
        )
    )
});

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