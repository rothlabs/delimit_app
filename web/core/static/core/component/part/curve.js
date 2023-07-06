import {createElement as c, useRef, memo} from 'react';
import {useS, useSS, useSub, gs} from '../../app.js';
//import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import {Line} from '@react-three/drei/Line';
import { Pickable } from '../node/base.js';
import {CatmullRomCurve3} from 'three';
import {Point} from './point.js';

const res = 100;

// function interpolate(d,n,a={}){
//     pts = new CatmullRomCurve3(pts.map(p=>p.pos)).getPoints(res).map(p=> [p.x, p.y, p.z]);
//     if(a.flat) pts = pts.flat();
//     return pts;
// }


export const Curve = memo(function Curve({n}){ 
    const obj = useRef();
    //useSS(d=> d.n[n].n.point); 
    const color = useS(d=> d.n[n].pick.color); 
    //const curve = useS(d=> d.n[n].c.curve);
    useSub(d=> d.n[n].c.curve, curve=>{ // make useSub that includes useEffect
        if(curve && obj.current){
            //const curve = new CatmullRomCurve3(pts.map(p=>p.pos));
            //obj.current.geometry.setPositions(curve.getPoints(res).map(p=> [p.x, p.y, p.z]).flat()); //new Float32Array(
            //obj.current.geometry.setPositions(interpolate(gs(),n,{flat:true}));
            //console.log(curve.getPoints(res));
            obj.current.geometry.setPositions(curve.getPoints(res).map(p=>[p.x, p.y, p.z]).flat());
        }
    });
    const curve = gs().n[n].c.curve;
    //console.log('render line', curve.getPoints(res));
    return(
        //c('group', {name:'line'},
            // points[0]?.n && c('group', {
            //     name:'points',
            // },
            //     ...points.map(p=> c(Point, {n:p.n, key:p.n})),
            // ),
            curve && c(Pickable, {n:n},//points?.length>1 && c(Pickable, {n:n}, // points && points.length>1 && 
                c(Line, {
                    ref: obj,
                    points: curve.getPoints(res).map(p=> [p.x, p.y, p.z]),//interpolate(gs(),n),//points.map(p=> [p.pos.x, p.pos.y, p.pos.z]), //[[0,0,0],[0,0,0]], //points: 
                    lineWidth: 3,
                    color: color[0],
                    //segments: res, // need to make this adjustable or dependent on zoom or line length 
                }),
            )//,
        //)
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