import {createElement as r, useEffect, useRef, useState, Fragment, forwardRef, useImperativeHandle } from 'react';
import {MeshLine, MeshLineMaterial, MeshLineRaycast } from './mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import {TextureLoader, Sphere, Vector3} from 'three';
import * as vtx from './vertex.js';
import {theme} from '../app.js';

//SET OBJECT Z INSTEAD OF VERTEX Z FOR PROPER RENDERING ORDER ///////////////////////////

extend({ MeshLine, MeshLineMaterial }) 
const sprite = new TextureLoader().load('/static/texture/disc.png');

export const Line = forwardRef(function Line(p, ref) {
    const mesh = useRef();
    const mesh_line = useRef();
    const endpoints = useRef();
    const endpoints_geom = useRef();
    const endpoints_color = useRef();
    const endpoints_pos = useRef();
    const material = useRef();
    const {camera} = useThree();
    const [selected, set_selected] = useState(false);
    const [selected_point, set_selected_point] = useState(-1);
    //const [verts, set_verts] = useState([]);
    //const [endpoint_verts, set_endpoint_verts] = useState([]);
    //const [act, set_act] = useState({name:''});
    const [constraints, set_constraints] = useState([]);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    const endpoint_verts=()=> {
        if(mesh_line.current) 
            return vtx.endpoints(mesh_line.current.positions, (selected_point==0)?30:20, (selected_point==1)?30:20);
        return new Float32Array([0,0,0,0,0,0]);
    }

    function prev_verts(){
        return history.verts[history.index-1];
    }

    function verts(){
        return mesh_line.current.positions; //mesh_line.current.attributes.position.array},//
    }

    function update(args){
        var verts = args.verts;
        if(!args.raw) verts = vtx.set_density(args.verts,1,2);
        mesh_line.current.setPoints(verts);
        endpoints_pos.current.array = endpoint_verts();
        //endpoints_geom.current.computeBoundingSphere();
        if(args.depth > 0){
            constraints.forEach(constraint =>{
                constraint.enforce({depth:args.depth});
            });
        }
        if(args.record) p.base.set_act({name:'record'});
    }

    useImperativeHandle(ref,()=>{return{ 
        update:(args)=> update(args),
        verts:()=>verts(),
        prev_verts:()=>prev_verts(),
        set_verts(vts){
            mesh_line.current.setPoints(vts);
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
                update({verts:new_verts, depth:2, record:true});
            }else if(selected_point == 1){
                const new_verts = vtx.map(prev_verts(), vtx.vect(prev_verts(),0), args.endpoint); //vtx.first(line.prev_verts())
                update({verts:new_verts, depth:2, record:true});
            }
        },
        add_constraint(constraint){
            set_constraints((c)=> [constraint, ...c]);
        },
    };});

    useFrame(()=> {
        material.current.lineWidth = 4 / camera.zoom;
        if(endpoints_color.current && endpoints_pos.current){
            endpoints_color.current.needsUpdate = true;
            endpoints_pos.current.needsUpdate = true;
        }
    }); // make this run only on zoom change

    // function strong_update(args){
    //     console.log('strong_update');
    //     //console.log(args.verts);
    //     var verts = args.verts;
    //     if(!args.raw) verts = vtx.set_density(args.verts,1,2);
    //     set_verts(verts);
    //     set_endpoint_verts(make_endpoint_verts(verts));
    //     if(args.depth > 0){
    //         constraints.forEach(constraint =>{
    //             //constraint.enforce({strength:'strong', depth:args.depth});
    //         });
    //     }
    //     if(args.record) p.base.set_act({name:'record'});
    // }

    //useEffect(()=>{
    //    if(act.name == 'update') strong_update(act);
    //},[act]);

    //useEffect(()=>{if(p.verts){
    //    strong_update({verts:p.verts, record:true});  
        //weak_update({verts:p.verts, record:true}); 
    //}},[p.verts]);

    useEffect(()=>{
        if(endpoints_pos.current) endpoints_geom.current.boundingSphere = new Sphere(new Vector3(),10000);
    },[endpoints_pos.current]);

    useEffect(()=>{
        //console.log(constraints.length);
        set_selected(false); 
        set_selected_point(-1); 
        if(p.selection){
            if(p.selection.object == mesh.current)      set_selected(true);
            if(p.selection.object == endpoints.current) set_selected_point(p.selection.index);
        }
    },[p.selection]);

    // useEffect(()=>{ 
    //     if(selected && p.mod.verts.length>5){
    //         const closest = vtx.closest_to_endpoints(verts, p.mod.verts);
    //         const new_verts = vtx.map(p.mod.verts, closest.v1, closest.v2);
    //         const new_verts_2 = vtx.replace(verts, closest.i1, closest.i2, new_verts);
    //         //strong_update({verts: new_verts_2, depth:1, record:true});
    //     }
    //     if(selected_point == 0){
    //         const new_verts = vtx.map(prev_verts(), p.mod.endpoint, vtx.vect(prev_verts(),-1)); //[draw.point.x,draw.point.y,0]
    //         //strong_update({verts:new_verts, depth:2, record:true});
    //     }else if(selected_point == 1){
    //         const new_verts = vtx.map(prev_verts(), vtx.vect(prev_verts(),0), p.mod.endpoint); //vtx.first(line.prev_verts())
    //         //strong_update({verts:new_verts, depth:2, record:true});
    //     }
	// },[p.mod]);

    useEffect(()=>{
        if(p.base.act && p.selection!='off'){
            if(p.base.act.name == 'record'){
                history.verts.splice(history.index);
                history.verts.push(verts());
                if(history.verts.length > 7){
                    history.verts.shift();
                }
                history.index = history.verts.length;
            //}else if(p.base.act.name == 'revert'){
            //    set_verts(history.verts[history.index-1]);
            }else if(p.base.act.name == 'undo'){
                if(history.index-1 > 0){
                    history.index--;
                    update({verts:history.verts[history.index-1], raw:true});
                }
            }else if(p.base.act.name == 'redo'){
                if(history.index+1 <= history.verts.length){
                    history.index++;
                    update({verts:history.verts[history.index-1], raw:true});
                }
            }
            set_history(history);
        }
    },[p.base.act]);

    return (r(Fragment,{},
        r('mesh', {
            name: 'line',
            ref: mesh,
            raycast: (p.selection!='off') ? MeshLineRaycast : undefined,
        },
            r('meshLine', {attach:'geometry', points: p.verts, ref:mesh_line}),
            r('meshLineMaterial', {ref:material, color:selected?theme.primary_s:theme.secondary_s}),
        ),
        (p.verts.length<6 || p.selection=='off') ? null :
            r('points',{name:'endpoint', ref:endpoints}, //,onPointerUp:(event)=>{console.log('endpoint up');}
                r('bufferGeometry',{ref:endpoints_geom},
                    r('bufferAttribute',{ref:endpoints_pos, attach: 'attributes-position', count:2, itemSize:3, array:endpoint_verts()}), 
                    r('bufferAttribute',{ref:endpoints_color, attach:'attributes-color', count:2, itemSize:3, array:new Float32Array([
                            ...(selected_point==0)? theme.primary: theme.secondary,
                            ...(selected_point==1)? theme.primary: theme.secondary,
                    ])}),
                ),
                r('pointsMaterial',{size:12, vertexColors:true, map:sprite, alphaTest:.2, transparent:true}),
            ),
    ))
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
//         geometry: new MeshLine(),
//     },[
//             r('planeGeometry', {args:[10000, 10000]}),
//             r('meshBasicMaterial', {color: 'white', toneMapped:false}),
//     ]);
// }

// export function camera_control_2d(){
//     const { camera, gl } = useThree();
//     useEffect(() => {
//         const mesh_line = new MeshLine();

//         return () => {
// 			mesh_line.dispose();
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