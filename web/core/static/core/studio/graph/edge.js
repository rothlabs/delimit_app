import {createElement as r, useState, useEffect, useRef, useMemo} from 'react';
import {MeshLineRaycast} from '../meshline.js';
import {useThree, useFrame} from 'r3f';
import {useD, theme, static_url, Fixed_Size_Group, uppercase} from '../../app.js';
import {Text} from 'drei';
import {Vector3} from 'three';

const tv = new Vector3();

export function Edge({id1, tag, id2}){
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
    useEffect(()=>useD.subscribe(d=>({   pos1:d.n[id1].graph.pos, pos2:d.n[id2].graph.pos   }),d=>{  
        text .current.obj.position.copy(d.pos2).add( tv.copy(d.pos1).sub(d.pos2).multiplyScalar(.35) );
        arrow.current.obj.position.copy(d.pos2).add( tv.copy(d.pos1).sub(d.pos2).multiplyScalar(.65) );
        arrow.current.obj.lookAt(d.pos1);
        arrow.current.obj.rotateX(1.5708);
        arrow.current.obj.position.setZ(d.pos1.z-100);
        meshline.current.setPoints([arrow.current.obj.position.x,arrow.current.obj.position.y,arrow.current.obj.position.z, d.pos2.x,d.pos2.y,d.pos2.z-100]);
    },{fireImmediately:true}),[]); 
    //console.log('render edge');
    return(
        r('group', {
            name: 'edge',
            onClick: (e)=> set_active(true),
            onPointerMissed: (e)=> {if(e.which == 1) set_active(false);},
            onPointerOver: (e)=> set_hover(true),
            onPointerOut: (e)=> set_hover(false),
        }, 
            r('mesh', { 
                raycast: MeshLineRaycast,
            },
                r('meshLine', {
                    ref: meshline, 
                    attach: 'geometry', 
                }), 
                r('meshLineMaterial', {ref:meshline_material, color:active||hover? theme.primary_s : theme.secondary_s}),
            ),
            r(Fixed_Size_Group, {
                ref: text,
                size: active ? 1.5 : 1,
            },
                r(Text, {
                    font: static_url+'font/Inter-Medium.ttf', 
                    outlineWidth: '25%',
                    outlineColor: 'white',
                    fontSize: 14,
                },
                    uppercase(tag),
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
                ),
            ),
            r(Fixed_Size_Group, {
                ref: arrow,
                size: active ? 1.5 : 1,
            },
                r('mesh', {},
                    r('coneGeometry', {args:[4,24,8]}),
                    r('meshBasicMaterial', {color: color, toneMapped:false}),
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