import {createElement as c, useRef, memo, useState} from 'react';
import {useS, useSS, useSub, useSubS, gs} from '../../app.js';
//import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import {Line} from '@react-three/drei/Line';
import { Pickable } from '../node/base.js';
import {CatmullRomCurve3} from 'three';
import {Point} from './point.js';

const res = 100; // make res dynamic ?!?!?!?!

// function interpolate(d,n,a={}){
//     pts = new CatmullRomCurve3(pts.map(p=>p.pos)).getPoints(res).map(p=> [p.x, p.y, p.z]);
//     if(a.flat) pts = pts.flat();
//     return pts;
// }


export const Curve = memo(function Curve({n}){ 
    const curve_ref = useRef();
    const segs_ref = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    const [curve_geo] = useState({pts:[[0,0,0],[0,0,0]]});
    const [segs_geo] = useState({pts:[[0,0,0],[0,0,0]]});
    useSub(d=> d.n[n].w.curve, curve=>{ // make useSub that includes useEffect
        if(curve){ //curve_ref.current && 
            curve_geo.pts = curve.getPoints(res).map(p=>[p.x, p.y, p.z]).flat();
            curve_ref.current.geometry.setPositions(curve_geo.pts);
            const pts = gs().n[n].w.pts;
            if(pts){
                segs_geo.pts = pts.map(p=>[p.x, p.y, p.z]).flat();
                segs_ref.current.geometry.setPositions(segs_geo.pts);
            }
        }
    });
    //console.log('render line');
    return(
        c('group', {name:'line'},
            c(Pickable, {n:n},//points?.length>1 && c(Pickable, {n:n}, // points && points.length>1 && 
                c(Line, {
                    ref: curve_ref,
                    points: curve_geo.pts,//curve.getPoints(res).map(p=> [p.x, p.y, p.z]),
                    lineWidth: 3,
                    color: color[0],
                }),
            ),
            c(Line, {
                ref: segs_ref,
                points: segs_geo.pts,//curve.getPoints(res).map(p=> [p.x, p.y, p.z]),
                lineWidth: 1,
                color: color[0],
                dashed: true,
                dashScale: 1,
            }),
        )
    )
})

//obj.current.geometry.setDrawRange(0,res);







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

// c(Fix_Size, { // renamed to Fix_Size or Static_Size
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