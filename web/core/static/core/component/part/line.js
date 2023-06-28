import {createElement as c, useRef, useEffect} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import { Pickable } from '../node/base.js';
import {CatmullRomCurve3} from 'three';
import {Point} from './point.js';

const res = 100;


export function Line({n}){ 
    const obj = useRef();
    useSS(d=> d.n[n].n.point); 
    const color = useS(d=> d.n[n].pick.color); 
    useSub(d=> d.n[n].c.point, pts=>{ // make useSub that includes useEffect
        if(obj.current){
            const curve = new CatmullRomCurve3(pts.map(p=>p.pos));
            obj.current.geometry.setPositions(curve.getPoints(res).map(p=> [p.x, p.y, p.z]).flat()); //new Float32Array(
        }
    });
    const points = gs().n[n].c.point;
    //console.log('render line');
    return(
        c('group', {name:'line'},
            points[0]?.n && c('group', {
                name:'points',
            },
                ...points.map(p=> c(Point, {n:p.n, key:p.n})),
            ),
            points?.length && c(Pickable, {n:n}, // points && points.length>1 && 
                c(CatmullRomLine, {
                    ref: obj,
                    points: points.map(p=> [p.pos.x, p.pos.y, p.pos.z]), //[[0,0,0],[0,0,0]], //points: 
                    lineWidth: 3,
                    color: color[0],
                    segments: res, // need to make this adjustable or dependent on zoom or line length 
                }),
            ),
        )
    )
}







// useEffect(()=>subS(d=> d.n[n].c.point, points=>{ // make useSub that includes useEffect
    //     const curve = new CatmullRomCurve3(points.map(p=>p.pos));
    //     obj.current.geometry.setPositions(curve.getPoints(res).map(p=>[p.x, p.y, p.z]).flat()); //new Float32Array(
    // }),[]);

// c(drei_line, {
                //     ref: obj,
                //     points: points.map(p=> [p.pos.x, p.pos.y, p.pos.z]),
                //     lineWidth: 3,
                //     color: color[0],
                //     //segments: true, 
                // }),

// c(Fixed_Size_Group, { // renamed to Fix_Size or Static_Size
                    //     size: 7, // 1.5 : 1, adjust size of other items
                    //     props:{position: [p.pos.x, p.pos.y, p.pos.z+100],}
                    // },
                    //     c(Pickable, {n:p.n}, c('mesh', {name:'point', geometry:circle_geometry,},
                    //         c('meshBasicMaterial', {color:p.color, toneMapped:false}),
                    //     )),
                    // ),

// points && c(Points, {ref:p_ref, limit:1000, range:1000}, 
            //     c(PointMaterial, {size:14, vertexColors:true, toneMapped:false, transparent:true}),
            //     ...points.map(p=> c(Pickable, {n:p.n}, 
            //         c(Point, {position: [p.pos.x, p.pos.y, p.pos.z+100], color:p.color}) 
            //     )),
            // ),

//const p_ref = useRef();
// if(p_ref.current){
//     //p_ref.current.geometry.boundingSphere = bounding_sphere;
//     //console.log('render line',p_ref.current, p_ref.current.geometry); // increase bounding sphere radius or recenter?
// }