import {createElement as r, useEffect, useRef, useState, Fragment, forwardRef, useImperativeHandle } from 'react';
import {MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import {TextureLoader} from 'three';
import * as vtx from 'easel/vertex.js';

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
    const [endpoint_verts, set_endpoint_verts] = useState([]);
    //const [act, set_act] = useState({name:''});
    const [constraints, set_constraints] = useState([]);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    const make_endpoint_verts=()=> {
        if(mesh_line.current) 
            return vtx.endpoints(mesh_line.current.positions, (selected_point==0)?2:1, (selected_point==1)?2:1);
        return [0,0,0,0,0,0];
    }

    function weak_update(args){
        //console.log(mesh_line.current.positions[0]);
        mesh_line.current.setPoints(args.verts);
        endpoints_pos.current.array = make_endpoint_verts();//args.verts);
        endpoints_geom.current.computeBoundingSphere();
        if(args.depth > 0){
            constraints.forEach(constraint =>{
                constraint.enforce({strength:'weak', depth:args.depth});
            });
        }
    }

    useImperativeHandle(ref,()=>{return{ 
        verts(){return mesh_line.current.positions}, //mesh_line.current.attributes.position.array},//
        set_verts(vts){
            mesh_line.current.setPoints(vts);
        },
        set_endpoint(new_endpoint){
            // function update(verts){
            //     mesh_line.current.setPoints(verts);
            //     endpoints_pos.current.array = make_endpoint_verts(verts);
            //     endpoints_geom.current.computeBoundingSphere();
            // }
            if(selected_point == 0) weak_update({verts:vtx.map(last_record(), new_endpoint, vtx.vect(last_record(),-1)), depth:2});
            if(selected_point == 1) weak_update({verts:vtx.map(last_record(), vtx.vect(last_record(),0), new_endpoint), depth:2});
        },
        weak_update:(args)=> weak_update(args),
        strong_update:(args)=> strong_update(args),
        last_record:()=>last_record(),//return history.verts[history.index-1]},//last_record, 
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

    function strong_update(args){
        console.log('strong_update');
        //console.log(args.verts);
        var verts = args.verts;
        if(!args.raw) verts = vtx.set_density(args.verts,1,2);
        set_verts(verts);
        set_endpoint_verts(make_endpoint_verts(verts));
        if(args.depth > 0){
            constraints.forEach(constraint =>{
                //constraint.enforce({strength:'strong', depth:args.depth});
            });
        }
        if(args.record) p.base.set_act({name:'record'});
    }

    //useEffect(()=>{
    //    if(act.name == 'update') strong_update(act);
    //},[act]);

    //useEffect(()=>{if(p.verts){
    //    strong_update({verts:p.verts, record:true});  
        //weak_update({verts:p.verts, record:true}); 
    //}},[p.verts]);

    useEffect(()=>{
        //console.log(constraints.length);
        set_selected(false); 
        set_selected_point(-1); 
        if(p.selection){
            if(p.selection.object == mesh.current)      set_selected(true);
            if(p.selection.object == endpoints.current) set_selected_point(p.selection.index);
        }
    },[p.selection]);

    useEffect(()=>{ 
        if(selected && p.mod.verts.length>5){
            const closest = vtx.closest_to_endpoints(verts, p.mod.verts);
            const new_verts = vtx.map(p.mod.verts, closest.v1, closest.v2);
            const new_verts_2 = vtx.replace(verts, closest.i1, closest.i2, new_verts);
            //strong_update({verts: new_verts_2, depth:1, record:true});
        }
        if(selected_point == 0){
            const new_verts = vtx.map(last_record(), p.mod.endpoint, vtx.vect(last_record(),-1)); //[draw.point.x,draw.point.y,0]
            //strong_update({verts:new_verts, depth:2, record:true});
        }else if(selected_point == 1){
            const new_verts = vtx.map(last_record(), vtx.vect(last_record(),0), p.mod.endpoint); //vtx.first(line.last_record())
            //strong_update({verts:new_verts, depth:2, record:true});
        }
	},[p.mod]);

    function last_record(){
        return p.verts;//history.verts[history.index-1];
    }

    useEffect(()=>{
        if(p.base.act && p.selection!='off'){
            if(p.base.act.name == 'record'){
                history.verts.splice(history.index);
                history.verts.push(verts);
                if(history.verts.length > 7){
                    history.verts.shift();
                }
                history.index = history.verts.length;
            //}else if(p.base.act.name == 'revert'){
            //    set_verts(history.verts[history.index-1]);
            }else if(p.base.act.name == 'undo'){
                if(history.index-1 > 0){
                    history.index--;
                    //strong_update({verts:history.verts[history.index-1], raw:true});
                }
            }else if(p.base.act.name == 'redo'){
                if(history.index+1 <= history.verts.length){
                    history.index++;
                    //strong_update({verts:history.verts[history.index-1], raw:true});
                }
            }
            set_history(history);
        }
    },[p.base.act]);

    //console.log('render line');
    //console.log(mesh_line.current);
    return (r(Fragment,{},
        r('mesh', {
            name: 'line',
            ref: mesh,
            raycast: (p.selection!='off') ? MeshLineRaycast : undefined,
        },
            r('meshLine', {attach:'geometry', points: p.verts, ref:mesh_line}),
            r('meshLineMaterial', {ref:material, color:selected?'lightblue':'grey',}),
            //...constraints.map((constraint)=>
        ),
        (p.verts.length<6 || p.selection=='off') ? null :
            r('points',{name:'endpoint', ref:endpoints}, //,onPointerUp:(event)=>{console.log('endpoint up');}
                r('bufferGeometry',{ref:endpoints_geom},
                    r('bufferAttribute',{ref:endpoints_pos, attach: 'attributes-position', count:2, itemSize:3, array:make_endpoint_verts()}), //endpoint_verts
                    r('bufferAttribute',{ref:endpoints_color, attach:'attributes-color', count:2, itemSize:3, array:new Float32Array([
                            ...(selected_point==0)? [.1,.2,1] : [.05,.05,.05],
                            ...(selected_point==1)? [.1,.2,1] : [.05,.05,.05],
                    ])}),
                ),
                r('pointsMaterial',{size:12, vertexColors:true, map:sprite, alphaTest:.5, transparent:true}),
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