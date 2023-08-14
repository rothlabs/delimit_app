import {createElement as c, useRef, memo, useState} from 'react';
import {useS, useSS, useSub, useSubS, gs} from '../../app.js';
//import {CatmullRomLine} from '@react-three/drei/CatmullRomLine';
import {Line} from '@react-three/drei/Line';
import { Pickable } from '../node/base.js';
import {CatmullRomCurve3} from 'three';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry';
import {Point} from './point.js';

const span = 1; 

// function interpolate(d,n,a={}){
//     pts = new CatmullRomCurve3(pts.map(p=>p.pos)).getPoints(res).map(p=> [p.x, p.y, p.z]);
//     if(a.flat) pts = pts.flat();
//     return pts;
// }


export const Curve = memo(({n})=>{ 
    const curve_ref = useRef([]);
    const segs_ref = useRef();
    const color = useS(d=> d.n[n].pick.color); 
    const pick = useS(d=> (d.n[n].pick.pick || d.n[n].pick.hover));
    const [curve_pts, set_curve_pts] = useState([]);//{pts:[[0,0,0],[0,0,0]]});
    const [segs_geo] = useState({pts:[[0,0,0],[0,0,0]]});//{pts:[[0,0,0],[0,0,0]]});
    //const [curve_count, set_curve_c] = useState(0);
    useSub(d=> d.n[n].ax.curve, curve=>{ // make useSub that includes useEffect
        const d = gs();
        // const curve2 = gs().n[n].ax.curve2;
        // if(curve2){
        //     curve_geo2.pts = curve2.getPoints(curve2.getLength()*res).map(p=>[p.x, p.y, p.z]).flat(); 
        //     curve_ref2.current.geometry = new LineGeometry();
        //     curve_ref2.current.geometry.setPositions(curve_geo2.pts);
        // }
        //if(dd[1]) dd=dd[1];
        if(curve != undefined){ //curve_ref.current && 
            if(!Array.isArray(curve)) curve = [curve];
            //console.log('curve_pts.length: '+curve_pts.length);
            if(curve.length == curve_pts.length){ // using old curve_pts so length always zero !!!!!!!!
                curve.forEach((curve,i) => {
                    var div = Math.round(curve.getLength()/span);
                    if(div < 100) div = 100;
                    curve_pts[i] = curve.getPoints(div).map(p=>[p.x, p.y, p.z]).flat();// change back to getPoints !!!!!!!
                    curve_ref.current[i].geometry = new LineGeometry();
                    curve_ref.current[i].geometry.setPositions(curve_pts[i]); 
                    //console.log('update curve');
                });
            }else{
                const new_curve_pts = [];
                curve.forEach((curve,i) => {
                    var div = Math.round(curve.getLength()/span);
                    if(div < 100) div = 100;
                    new_curve_pts.push(curve.getPoints(div).map(p=>[p.x, p.y, p.z]).flat());// change back to getPoints !!!!!!!
                });
                set_curve_pts(new_curve_pts);
                //console.log('set curve');
                //console.log('new_curve_pts: ');
                //console.log(new_curve_pts);
            }
            //ss(d=> d.n[n].c.rendered_curves = curve.length);
            const pts = d.n[n].ax.pts;
            if(pts){
                segs_geo.pts = pts.map(p=>[p.x, p.y, p.z]).flat();
                segs_ref.current.geometry.setPositions(segs_geo.pts);
            }
        }
    },[curve_pts]);
    //console.log('render curve');
    return(
        c('group', {name:'line'},
            c(Pickable, {n:n},//points?.length>1 && c(Pickable, {n:n}, // points && points.length>1 && 
                curve_pts.map((curve_pts, i)=>(
                    //console.log(l);
                    c(Line, {
                        ref:el=> curve_ref.current[i] = el,
                        points: curve_pts,//curve.getPoints(res).map(p=> [p.x, p.y, p.z]),
                        lineWidth: pick ? 4 : 3,
                        color: color[0],
                    })
                )),
                // c(Line, {
                //     ref: curve_ref2,
                //     points: curve_geo2.pts,//curve.getPoints(res).map(p=> [p.x, p.y, p.z]),
                //     lineWidth: pick ? 4 : 3,
                //     color: 'green',
                // }),
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






// curve_geos ? curve_geo.map(cg=>{
//     c(Line, {
//         ref:el=> curve_ref.current[i] = el,
//         points: curve_geos[i].pts,//curve.getPoints(res).map(p=> [p.x, p.y, p.z]),
//         lineWidth: pick ? 4 : 3,
//         color: color[0],
//     })
// }) :
// c(Line, {
//     ref: curve_ref,
//     points: curve_geo.pts,//curve.getPoints(res).map(p=> [p.x, p.y, p.z]),
//     lineWidth: pick ? 4 : 3,
//     color: color[0],
// }),





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