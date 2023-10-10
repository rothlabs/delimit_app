import {current} from 'immer';
import {Vector3, CatmullRomCurve3, MathUtils, Matrix4} from 'three';
import {NURBSSurface} from 'three/examples/jsm/curves/NURBSSurface';
import {curve} from './curve.js';
//import Delaunator from 'delaunator';
//import { closest } from '../../junk/vertex.js';

const v0 = new Vector3();
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const degree_u = 2;
const degree_v = 2;
const nsr = .0001; // normal sample radius

const catmullrom = (d, pts, smooth, matrix)=>{
    const smt = pts.map(p=> p.clone());
    const curve = new CatmullRomCurve3(smt);
    curve.arcLengthDivisions = 2000; // need to make proportional to length of curve! ?!?!?!?!?!?! #1
    const pt_span = curve.getLength() / smt.length;
    const range = Math.round(smooth / pt_span / 2) + 1; // +1 here ?!?!?!?!?!
    //console.log('smooth range: '+range);
    for(let i=1; i<smt.length-1; i++){ 
        var vc = 1;
        var rng = range;
        if(rng > i) rng = i;
        if(rng > smt.length-1-i) rng = smt.length-1-i;
        for(let k=-rng; k<=rng; k++){ 
            if(k != 0 && pts[i+k]){
                smt[i].add(pts[i+k]);
                vc++;
            }
        }
        smt[i].divideScalar(vc);      
    }
    //smt.push(pts.at(-1).clone());
    const smoothed = new CatmullRomCurve3(smt);
    smoothed.arcLengthDivisions = 2000;
    return d.part.curve(d, smoothed, matrix);//[smt, curve];
}

export const create_part_slice = (set,get)=>({part:{
    curve,
    catmullrom,
    surface(d, pts, a={}){
        try{
            var length_u = 0;
            var length_v = 0;
            var knots_u = [0,0,0];
            var knots_v = [0,0,0];
            for(let u=1; u<pts.length-1; u++){ // build curves to get more accurate arc length ?!?!?!?!?!?!
                var dist = 0;
                for(let v=0; v<pts[0].length; v++){
                    dist += pts[u][v].distanceTo(pts[u-1][v]);
                }
                length_u += (dist/(pts[0].length));
                knots_u.push(u);
            }
            for(let v=1; v<pts[0].length-1; v++){
                var dist = 0;
                for(let u=0; u<pts.length; u++){
                    dist += pts[u][v].distanceTo(pts[u][v-1]);
                }
                length_v += (dist/(pts.length));
                knots_v.push(v);
            }
            knots_u.push(knots_u.at(-1), knots_u.at(-1));
            knots_v.push(knots_v.at(-1), knots_v.at(-1));

            const surface = new NURBSSurface(degree_u, degree_v, knots_u, knots_v, pts);

            surface.get_point = (u, v, point)=>{
                if(a.shift_map){
                    //var x = MathUtils.clamp(Math.round((1-v) * a.shift_map_width), 0, a.shift_map_width-1);
                    //var y = MathUtils.clamp(Math.round((1-u) * a.shift_map_height), 0, a.shift_map_height-1);
                    //var i = (x + y * a.shift_map_width) * 4;
                    surface.get_point_normal(u, v, point, v0);
                    //point.add(v1.multiplyScalar(a.shift_map[i]/255*10));
                }else{
                    surface.getPoint(u, v, point);
                }
                return point;
            }
            surface.get_point_normal = (u, v, point, normal)=>{
                surface.getPoint(u+nsr, v,                      point); // right most point
                surface.getPoint(u-(nsr*0.5), v+(nsr*0.866025), v2); // cos(120) sin(120)
                surface.getPoint(u-(nsr*0.5), v-(nsr*0.866025), v3); // cos(-120) sin(-120)
                normal.copy(v2).sub(point).cross(v3.sub(point)).normalize();
                if(a.shift_map){
                    var x = MathUtils.clamp(Math.round(u * a.shift_map_width), 0, a.shift_map_width-1);
                    var y = MathUtils.clamp(Math.round((1-v) * a.shift_map_height), 0, a.shift_map_height-1);
                    var i = (x + y * a.shift_map_width) * 4;
                    //surface.get_point_normal(u, v, point, v1);
                    point.add(v1.copy(normal).multiplyScalar((1-a.shift_map[i]/255)*4));
                }
            }

            surface.length_u = length_u;
            surface.length_v = length_v;
            if(a.length_u) surface.length_u = a.length_u;
            if(a.length_v) surface.length_v = a.length_v;

            return surface;
        }catch(e){
            console.log(e);
        }
    }
}});


// points: curve.getPoints(2)[0].z ?? matrix ? 
//                 (cnt)=> curve.getPoints(cnt).map(pnt=> pnt.applyMatrix4(matrix)): 
//                 (cnt)=> curve.getPoints(cnt) || matrix ? 
//                 (cnt)=> curve.getPoints(cnt).map(pnt=> new Vector3(pnt.x, pnt.y, 0).applyMatrix4(matrix)): 
//                 (cnt)=> curve.getPoints(cnt).map(pnt=> new Vector3(pnt.x, pnt.y, 0)),

            //var max_range = i;
            //if(smt.length-1-i < max_range) max_range = smt.length-1-i;
            //if(rng > max_range) rng = max_range;


// KNOTS BY DISTANCE
// var knots_u = [0,0,0];
// var knots_v = [0,0,0];
// for(let u=1; u<pts.length-1; u++){
//     var dist = 0;
//     for(let v=0; v<pts[0].length; v++){
//         dist += pts[u][v].distanceTo(pts[u-1][v]);
//     }
//     knots_u.push(knots_u.at(-1) + (dist/(pts[0].length)));
// }
// for(let v=1; v<pts[0].length-1; v++){
//     var dist = 0;
//     for(let u=0; u<pts.length; u++){
//         dist += pts[u][v].distanceTo(pts[u][v-1]);
//     }
//     knots_v.push(knots_v.at(-1) + (dist/(pts.length)));
// }
// const length_u = knots_u.at(-1);
// const length_v = knots_v.at(-1);
// knots_u.push(length_u,length_u);
// knots_v.push(length_v,length_v);



// KNOTS BY INDEX
// var knots_u = [0,0];
// var knots_v = [0,0];
// for(let i=0; i<pts.length-1; i++){
//         knots_u.push(i);
// }
// knots_u.push(knots_u.at(-1), knots_u.at(-1));

// for(let i=0; i<pts[0].length-1; i++){
//     knots_v.push(i);
// }
// knots_v.push(knots_v.at(-1), knots_v.at(-1));








            // for(let i=0; i<knots_u.length; i++){
            //     knots_u[i] /= scale_u;
            // }
            // for(let i=0; i<knots_v.length; i++){
            //     knots_v[i] /= scale_v;
            // }


        // surface.get_point_plane = (u, v, point, plane)=>{
        //     surface.getPoint(u+.010, v,        point); // right most point
        //     surface.getPoint(u-.005, v+.00866, v2); // cos(120) sin(120)
        //     surface.getPoint(u-.005, v-.00866, v3); // cos(-120) sin(-120)
        //     plane.setFromCoplanarPoints(point, v2, v3);
        // }

                    // surface.getPoint(u+.010, v,        point); // right most point
            // surface.getPoint(u-.005, v+.00866, v2); // cos(120) sin(120)
            // surface.getPoint(u-.005, v-.00866, v3); // cos(-120) sin(-120)



// var knots_u = [0,0];

// var last_knot = 0;
// pts.forEach((p,i) => {
//     if(i < pts.length-1){
//         knots_u.push(i);
//         last_knot = i;
//     }else{
//         knots_u.push(last_knot,last_knot);
//     }
// });
// var knots_v = [0,0];
// pts[0].forEach((p,i) => {
//     if(i < pts[0].length-1) knots_v.push(i);
// });
// //knots_v = knots_v.concat([pts[0].length-2, pts[0].length-2]);
// knots_v.push(pts[0].length-2, pts[0].length-2);