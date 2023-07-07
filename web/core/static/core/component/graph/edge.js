import {createElement as c, useState, useEffect, useRef, useMemo} from 'react';
//import {MeshLineRaycast} from '../../three/MeshLine.js';
import {useThree, useFrame} from '@react-three/fiber';
import {useS, gs, useSubS, theme, static_url, readable} from '../../app.js';
//import {Text} from '@react-three/drei/Text';
import {Vector3} from 'three';
import {Line} from '@react-three/drei/Line';
import {Fix_Size} from '../base/base.js';

const tv = new Vector3();
const z_pos = -1;

export function Edge({r, t, n}){  // need to make edges their own object in store with reckon function
    //const meshline = useRef();
    //const meshline_material = useRef();
    const text = useRef();
    const line = useRef();
    //const arrow = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    //const {camera} = useThree();
    //useFrame(()=>{
    //    meshline_material.current.lineWidth = 1.5 / camera.zoom;
    //});
    useSubS(d=> [d.n[r].graph, d.n[n].graph], d=>{ 
        if(text.current) text.current.position.copy(d[1].pos).add( tv.copy(d[0].pos).sub(d[1].pos).multiplyScalar(.5) );
        line.current.geometry.setPositions([d[0].pos.x,d[0].pos.y,d[0].pos.z+z_pos, d[1].pos.x,d[1].pos.y,d[1].pos.z+z_pos]);
    }); 
        //arrow.current.obj.position.copy(d[1].pos).add( tv.copy(d[0].pos).sub(d[1].pos).multiplyScalar(.75) );
        //arrow.current.obj.lookAt(d[0].pos);
        //arrow.current.obj.rotateX(1.5708);
        //arrow.current.obj.position.setZ(d[0].pos.z-100);
        //meshline.current.setPoints([arrow.current.obj.position.x,arrow.current.obj.position.y,arrow.current.obj.position.z, d[1].pos.x,d[1].pos.y,d[1].pos.z-100]);
        //console.log('update edge pos');
    //console.log('render edge');
    //const rg = useS(d=> d.n[r].graph);
    //const ng = useS(d=> d.n[n].graph);
    const d = gs();
    const rp = d.n[r].graph.pos;
    const np = d.n[n].graph.pos;
    return(
        c('group', { // not using Pickable because it is not a node. make another Pickable for none node objects
            name: 'edge',
            onClick: e=> set_active(true),
            onPointerMissed: e=> {if(e.which == 1) set_active(false);},
            onPointerOver: e=> set_hover(true),
            onPointerOut: e=> set_hover(false),
        }, 
            c(Line, {
                ref: line,
                points:[[rp.x, rp.y, rp.z+z_pos], [np.x, np.y, np.z+z_pos]],       // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
                color:color,                   // Default
                lineWidth:1,                   // In pixels (default)
                segments:false,                 // If true, renders a THREE.LineSegments2. Otherwise, renders a THREE.Line2
                dashed:false,                   // Default
                //vertexColors:true,              // Optional array of RGB values for each point
                //{...lineProps}                  // All THREE.Line2 props are valid
                //{...materialProps}              // All THREE.LineMaterial props are valid
            }),
            // c('mesh', { 
            //     raycast: MeshLineRaycast,
            // },
            //     c('meshLine', {
            //         ref: meshline, 
            //         attach: 'geometry', 
            //     }), 
            //     c('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            // ),
            d.n[r].t!=t && d.n[n].t!=t && c(Fix_Size, {
                ref: text,
                size: active ? 1.25 : 1,
            },
                c('text', {
                    font: static_url+'font/Inter-Medium.ttf', 
                    outlineWidth: '25%',
                    outlineColor: 'white',
                    fontSize: 14,
                    anchorX: 'center',
                    anchorY: 'middle',
                    text: readable(t),
                },
                    c('meshBasicMaterial', {color: color, toneMapped:false}),// causing unsupported texture colorspace: undefined
                ),
            ),
            // c(Fix_Size, {
            //     ref: arrow,
            //     size: active ? 1.5 : 1,
            // },
            //     c('mesh', {},
            //         c('coneGeometry', {args:[4,24,8]}),
            //         c('meshBasicMaterial', {color: color, toneMapped:false}),
            //     ),
            // ),
        )
    )
}


//text.current.obj.position.copy(d.pos1).add(d.pos2).multiplyScalar(.25);//.setZ(d.pos1.z-90);

//arrow.current.position.copy(d.pos1).sub(d.pos2).normalize().multiplyScalar(24);

//obj.current.obj.updateMatrixWorld(true);
//arrow.current.getWorldPosition(tv);
        //meshline.current.setPoints([tv.x,tv.y,tv.z-100, d.pos2.x,d.pos2.y,d.pos2.z-100]);

    //function sync(){
    //    meshline.current.setPoints([source.pos.x,source.pos.y,source.pos.z-100, target.pos.x,target.pos.y,target.pos.z-100]);
    //    text.current.obj.position.copy(source.pos).add(target.pos).multiplyScalar(.5).setZ(target.pos.z-90);
    //}