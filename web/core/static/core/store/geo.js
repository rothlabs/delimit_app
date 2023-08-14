import {current} from 'immer';
import {Vector3, CatmullRomCurve3} from 'three';
import {NURBSSurface} from 'three/examples/jsm/curves/NURBSSurface';
//import Delaunator from 'delaunator';
//import { closest } from '../../junk/vertex.js';

const v2 = new Vector3();
const v3 = new Vector3();
const degree_u = 2;
const degree_v = 2;
const nsr = .001; // normal sample radius

export const create_geo_slice = (set,get)=>({geo:{
    smooth_catmullrom(d, pts, span){
        const smt = pts.map(p=> p.clone());
        const curve = new CatmullRomCurve3(smt);
        curve.arcLengthDivisions = 2000; // need to make proportional to length of curve!!!
        const pt_span = curve.getLength() / smt.length;
        const range = Math.round(span / pt_span) + 1; // +1 here ?!?!?!?!?!
        for(let i=1; i<smt.length-1; i++){ 
            var vc = 1;
            for(let k=-range; k<=range; k++){ 
                if(k != 0 && pts[i+k]){
                    smt.at(-1).add(pts[i+k]);
                    vc++;
                }
            }
            smt.at(-1).divideScalar(vc);      
        }
        //smt.push(pts.at(-1).clone());
        return curve;
    },
    surface(d,pts){
        try{
            const knots_u = [0,0,0];
            const knots_v = [0,0,0];

            for(let u=1; u<pts.length-1; u++){
                var dist = 0;
                for(let v=0; v<pts[0].length; v++){
                    dist += pts[u][v].distanceTo(pts[u-1][v]);
                }
                knots_u.push(knots_u.at(-1) + (dist/(pts[0].length)));
            }
            for(let v=1; v<pts[0].length-1; v++){
                var dist = 0;
                for(let u=0; u<pts.length; u++){
                    dist += pts[u][v].distanceTo(pts[u][v-1]);
                }
                knots_v.push(knots_v.at(-1) + (dist/(pts.length)));
            }
            const length_u = knots_u.at(-1);
            const length_v = knots_v.at(-1);
            knots_u.push(length_u,length_u);
            knots_v.push(length_v,length_v);

            const surface = new NURBSSurface(degree_u, degree_v, knots_u, knots_v, pts);

            surface.get_point = (u, v, target)=>{
                surface.getPoint(u, v, target);
                return target;
            }
            surface.get_point_normal = (u, v, point, normal)=>{
                surface.getPoint(u+nsr, v,                      point); // right most point
                surface.getPoint(u-(nsr*0.5), v+(nsr*0.866025), v2); // cos(120) sin(120)
                surface.getPoint(u-(nsr*0.5), v-(nsr*0.866025), v3); // cos(-120) sin(-120)
                normal.copy(v2).sub(point).cross(v3.sub(point)).normalize();
            }
            surface.length_u = length_u;
            surface.length_v = length_v;

            return surface;
        }catch(e){
            console.log(e);
        }
    }
}});


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