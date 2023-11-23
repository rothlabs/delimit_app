import {createElement as c, useState, useEffect, useRef, useMemo} from 'react';
//import {MeshLineRaycast} from '../../three/MeshLine.js';
import {useThree, useFrame} from '@react-three/fiber';
import {useS, gs, useSubS, theme, static_url, readable} from '../../app.js';
//import {Text} from '@react-three/drei/Text';
import {Vector3} from 'three';
import {Line} from '@react-three/drei/Line';
//import {View_Transform} from '../node/base.js';

const root_pos = new Vector3();
const stem_pos = new Vector3();
const offset = new Vector3(0, 0, -1);

export function Edge({root, term, stem}){  // need to make edges their own object in store with reckon function
    //const line = useRef();
    const color = useS(d=> d.color.border);
    const rp    = useS(d=> d.graph.node.get(root).pos);
    const sp    = useS(d=> d.graph.node.get(stem).pos);
    root_pos.copy(rp).add(offset);
    stem_pos.copy(sp).add(offset);
    //console.log('render edge');
    return(
        c(Line, {
            //ref: line,
            points:[root_pos, stem_pos],//[[rp.x, rp.y, rp.z+z_pos], [sp.x, sp.y, sp.z+z_pos]],       // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
            color,                   // Default
            //lineWidth: 1,                   // In pixels (default)
            //segments: false,                 // If true, renders a THREE.LineSegments2. Otherwise, renders a THREE.Line2
            //dashed: false,                   // Default
            //vertexColors:true,              // Optional array of RGB values for each point
            //{...lineProps}                  // All THREE.Line2 props are valid
            //{...materialProps}              // All THREE.LineMaterial props are valid
        })
    );
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