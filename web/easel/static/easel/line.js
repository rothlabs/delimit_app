import {createElement as r, useEffect, useRef, useState, Fragment, forwardRef, useImperativeHandle } from 'react';
import {MeshLine, MeshLineMaterial, MeshLineRaycast } from 'core/mesh_line.js';
import {extend, useThree, useFrame} from 'r3f';
import {TextureLoader} from 'three';
import * as vtx from 'easel/vertex.js';

extend({ MeshLine, MeshLineMaterial }) 
const sprite = new TextureLoader().load('/static/texture/disc.png');

export const Line = forwardRef(function Line(p, ref) {
    const mesh = useRef();
    const geom = useRef();
    const endpoints = useRef();
    const endpoints_color = useRef();
    const endpoints_pos = useRef();
    const material = useRef();
    const {camera} = useThree();
    const [selected, set_selected] = useState(false);
    const [selected_point, set_selected_point] = useState(-1);
    const [verts, set_verts] = useState([]);
    const [act, set_act] = useState({name:''});
    const [constraints, set_constraints] = useState([]);
    const [history, set_history] = useState({
        verts:[],
        index:0,
    });

    useImperativeHandle(ref, () => {return {
        set_verts(vts){
            geom.current.setPoints(vts);
            //endpoints_pos.current.setAttribute('position', new THREE.BufferAttribute(vtx.endpoints(verts,
            //    (selected_point==0)? 3 : 2,
            //    (selected_point==1)? 3 : 2,
            //),3));
            //endpoints_pos.current.computeBoundingSphere();
        },
        set_endpoint(ep){

        },
    };});

    useFrame(()=> {
        material.current.lineWidth = 4 / camera.zoom;
        if(endpoints_color.current && endpoints_pos.current){
            endpoints_color.current.needsUpdate = true;
            endpoints_pos.current.needsUpdate = true;
        }
    }); // make this run only on zoom change

    useEffect(()=>{
        if(act.name == 'update'){
            if(act.density){
                set_verts(vtx.set_density(act.verts,1,2));
            }
            if(act.depth > 0){
                constraints.forEach(constraint =>{
                    constraint.set_act({name:'enforce', depth:act.depth});
                });
            }
            if(act.record){
                p.base.set_act({name:'record'});
            }
        }
    },[act]);

    useEffect(()=>{
        if(p.verts){
            set_verts(p.verts);
        }
    },[p.verts]);

    useEffect(()=>{
        set_selected(false); 
        set_selected_point(-1); 
        if(p.selection){
            if(p.selection.object == mesh.current){
                set_selected(true);
            }else if(p.selection.object == endpoints.current){
                set_selected_point(p.selection.index);
            }
        }
    },[p.selection]);

    useEffect(()=>{ 
       if(selected){
            const closest = vtx.closest_to_endpoints(verts, p.mod_verts);
            const new_verts = vtx.map(p.mod_verts, closest.v1, closest.v2);
            const new_verts_2 = vtx.replace(verts, closest.i1, closest.i2, new_verts);
            set_act({name:'update', verts: new_verts_2, density:true, constrain:true, record:true});
       }
	},[p.mod_verts]);

    useEffect(()=>{ 
        if(selected_point == 0){
            const new_verts = vtx.map(last_record(), p.mod_vertex, vtx.vect(last_record(),-1)); //[draw.point.x,draw.point.y,0]
            set_act({name:'update', verts:new_verts, density:true});
        }else if(selected_point == 1){
            const new_verts = vtx.map(last_record(), vtx.vect(last_record(),0), p.mod_vertex); //vtx.first(line.last_record())
            set_act({name:'update', verts:new_verts, density:true});
        }
    },[p.mod_vertex]);

    function last_record(){
        return history.verts[history.index-1];
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
                    set_verts(history.verts[history.index-1]);
                }
            }else if(p.base.act.name == 'redo'){
                if(history.index+1 <= history.verts.length){
                    history.index++;
                    set_verts(history.verts[history.index-1]);
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
            r('meshLine', {attach:'geometry', points: verts, ref:geom}),
            r('meshLineMaterial', {ref:material, color:selected?'lightblue':'grey',}),
            //...constraints.map((constraint)=>
        ),
        (verts.length<6 || p.selection=='off') ? null :
            r('points',{name:'endpoint', ref:endpoints},
                r('bufferGeometry',{},
                    r('bufferAttribute', {ref:endpoints_pos, attach: 'attributes-position', count:2, itemSize:3, array:vtx.endpoints(verts,
                        (selected_point==0)? 3 : 2,
                        (selected_point==1)? 3 : 2,
                    )}),
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