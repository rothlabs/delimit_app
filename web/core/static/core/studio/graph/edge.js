import {createElement as c, useState, useEffect, useRef, useMemo} from 'react';
import {MeshLineRaycast} from '../meshline.js';
import {useThree, useFrame} from '@react-three/fiber';
import {subSS, theme, static_url, Fixed_Size_Group} from '../../app.js';
import {Text} from '@react-three/drei/Text';
import {Vector3} from 'three';

const tv = new Vector3();

export function Edge({r, tag, n}){
    const meshline = useRef();
    const meshline_material = useRef();
    const text = useRef();
    const arrow = useRef();
    const [active, set_active] = useState(false);
    const [hover, set_hover] = useState(false);
    const color = useMemo(()=> active||hover? theme.primary : theme.secondary, [active, hover]);
    const {camera} = useThree();
    useFrame(()=>{
        meshline_material.current.lineWidth = 1.5 / camera.zoom;
    });
    useEffect(()=> subSS(d=> [d.n[r].graph, d.n[n].graph], d=>{ 
        text .current.obj.position.copy(d[1].pos).add( tv.copy(d[0].pos).sub(d[1].pos).multiplyScalar(.35) );
        arrow.current.obj.position.copy(d[1].pos).add( tv.copy(d[0].pos).sub(d[1].pos).multiplyScalar(.65) );
        arrow.current.obj.lookAt(d[0].pos);
        arrow.current.obj.rotateX(1.5708);
        arrow.current.obj.position.setZ(d[0].pos.z-100);
        meshline.current.setPoints([arrow.current.obj.position.x,arrow.current.obj.position.y,arrow.current.obj.position.z, d[1].pos.x,d[1].pos.y,d[1].pos.z-100]);
        //console.log('update edge pos');
    }),[]); 
    //console.log('render edge');
    return(
        c('group', {
            name: 'edge',
            onClick: (e)=> set_active(true),
            onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
            onPointerOver: (e)=> set_hover(true),
            onPointerOut: (e)=> set_hover(false),
        }, 
            c('mesh', { 
                raycast: MeshLineRaycast,
            },
                c('meshLine', {
                    ref: meshline, 
                    attach: 'geometry', 
                }), 
                c('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            ),
            c(Fixed_Size_Group, {
                ref: text,
                size: active ? 1.5 : 1,
            },
                c(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    outlineWidth: '25%',
                    outlineColor: 'white',
                    fontSize: 14,
                },
                    tag,
                    c('meshBasicMaterial', {color: color, toneMapped:false}),// causing unsupported texture colorspace: undefined
                ),
            ),
            c(Fixed_Size_Group, {
                ref: arrow,
                size: active ? 1.5 : 1,
            },
                c('mesh', {},
                    c('coneGeometry', {args:[4,24,8]}),
                    c('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
            ),
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