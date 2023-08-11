import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, Ray, CatmullRomCurve3, Box3, Raycaster, Mesh, MeshBasicMaterial, Line3, Plane, LineCurve3, CurvePath} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const v5 = new Vector3();
const v6 = new Vector3();
const v7 = new Vector3();
const v8 = new Vector3();
const v9 = new Vector3();
const m1 = new Matrix4();
const axis = new Vector3();
const ortho1 = new Vector3();
const ortho2 = new Vector3();

const span = 5; 
const origin_surface_res = 400;
const surface_res = 900;
const max_shift = .1;
const min_point_dist = 1;
const end_clip = 4;


export const coil = {
    node(d, n){
        try{
            console.log('Compute Coil - pivots');
            delete d.n[n].c.paths;
            delete d.n[n].ax.curve;
            const c = d.reckon.v(d, n, 'axis_x axis_y axis_z');
            axis.set(c.axis_x, c.axis_y, c.axis_z);
            ortho1.set(c.axis_z, c.axis_x, c.axis_y);
            ortho2.copy(axis).cross(ortho1);
            const surfaces  = d.n[n].n.surface.map(surface=> d.n[surface].c.surface);
            const pivots = {};
            var first_pivot = 0;
            var last_pivot = 0;
            surfaces.forEach((surface, si) => {
                for(let u=0; u<origin_surface_res; u++){
                    for(let v=0; v<origin_surface_res; v++){ 
                        surface.get_point(u/origin_surface_res, v/origin_surface_res, v1);
                        v2.copy(v1).projectOnVector(axis);
                        let k = Math.round(v2.length()*Math.sign(v2.dot(axis)));
                        if(!pivots['k'+k]) pivots['k'+k] = {b:new Box3(), v: new Vector3()};
                        pivots['k'+k].b.expandByPoint(v1);
                        if(k < first_pivot) first_pivot = k;
                        if(k > last_pivot) last_pivot = k;
                    }
                }
            });
            Object.values(pivots).forEach(pivot=> pivot.b.getCenter(pivot.v));
            console.log('Compute Coil - points');
            const surf_data = [];
            var big_moves = 0;
            surfaces.forEach(surface => {
                for(let u=0; u<surface_res; u++){
                    for(let v=0; v<surface_res; v++){ 
                        surface.get_point_normal(u/surface_res, v/surface_res, v1, v9);
                        v2.copy(v1).projectOnVector(axis); // axis point
                        let axis_pos = v2.length()*Math.sign(v2.dot(axis));
                        //let remainder = axis_pos % 1;
                        let kn = Math.round(axis_pos);
                        if(kn < first_pivot + end_clip || kn > last_pivot - end_clip) continue;
                        let pivot = pivots['k'+kn].v;  // get pivot1
                        // let alpha = Math.abs(axis_pos % 1);
                        // if(alpha < 0.5){ 
                        //     if(pivots['k'+kn+Math.sign(axis_pos)]){
                        //         v3.lerpVectors(pivot, pivots['k'+kn+Math.sign(axis_pos)].v, alpha);
                        //     }else{v3.copy(pivot);}
                        // }else{
                        //     if(pivots['k'+kn-Math.sign(axis_pos)]){
                        //         v3.lerpVectors(pivots['k'+kn-Math.sign(axis_pos)].v, pivot, alpha);
                        //     }else{v3.copy(pivot);}
                        // }
                        v4.copy(v1).sub(pivot); // vector from pivot to surface point
                        var angle = v4.angleTo(ortho1) * Math.sign(v4.dot(ortho2)); 
                        if(angle < 0) angle += Math.PI*2;
                        var shift = -((axis_pos + (angle/(Math.PI*2))*span) % span); // remainder
                        if (Math.abs(shift) > span/2){ // need Math.abs(shift) here ?!?!?!??!?!?!
                            shift = -(span-Math.abs(shift))*Math.sign(shift);
                            //big_moves++;
                        }
                        if(Math.abs(shift) < max_shift){
                            v7.copy(axis).multiplyScalar(shift); // shift along axis vector to align with coil
                            v8.copy(v1).add(v7); // new surface point
                            surf_data.push({p:v8.clone(), n:v9.clone(), o:axis_pos+shift});
                        }
                    }
                }
            });
            console.log('big moves: '+big_moves);
            console.log('Compute Coil - sort');
            surf_data.sort((a,b)=> a.o-b.o);
            console.log('Compute Coil - path');
            var curve = new CurvePath();
            curve.arcLengthDivisions = 2000;
            var paths = [[{
                p: surf_data[0].p,
                n: surf_data[0].n,
            }]];
            var last_point = paths[0][0].p;
            for(let i=1; i<surf_data.length; i++){ 
                let dist = last_point.distanceTo(surf_data[i].p);
                if(dist > min_point_dist){
                    curve.add(new LineCurve3(last_point, surf_data[i].p));
                    paths[0].push({
                        p: surf_data[i].p,
                        n: surf_data[i].n,
                    });
                    last_point = surf_data[i].p;
                } 
            }
            d.n[n].c.paths = paths;//{pts:pts, nml:nml};
            d.n[n].ax.curve = curve; // make curve an array of auxiliary curves ?!?!?!?!?!
            console.log('Reckoned Coil!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};

// pts.push(surf_data[i].p);
// nml.push(surf_data[i].n);

            //var pts = [first_point];
            //var nml = [surf_data[0].n];
            //var nml_ref = [surf_data[0].n.clone()];
            //var surface_dists = [0];
            //nml_ref.push(surf_data[i].n.clone());
            //surface_dists.push(dist);


            // var curve = new CatmullRomCurve3(pts);
            // curve.arcLengthDivisions = 2000;
            // var nml_curve = new CatmullRomCurve3(nml);
            // nml_curve.arcLengthDivisions = 2000;
            // //pts = pts.map(p=> p.clone());

            // const pt_count = Math.round(curve.getLength()*code_res);
            // pts = curve.getSpacedPoints(pt_count);
            // // nml = nml_curve.getSpacedPoints(pt_count);
            // var nml = [];
            // var nml2 = [];
            // //var normal = new Vector3(0,0,-1);
            // var t = 0;
            // var step_t = 1/pts.length/100;
            // for(let i=0; i<pts.length; i++){ 
            //     var prev_dist = 10000;
            //     for(let k=0; k<100000; k++){ 
            //         t += step_t;
            //         var normal = nml_curve.getPoint(t);
            //         let dist = normal.distanceTo(pts[i]);
            //         if(dist > prev_dist){
            //             t -= step_t;
            //             nml_curve.getPoint(t, normal);
            //             break;
            //         }
            //         prev_dist = dist;
            //     }
            //     normal.sub(pts[i]);
            //     nml.push(normal);
            //     nml2.push(normal.clone());
            // }


                    // let step = Math.round(v1.distanceTo(pts[i]) / 1); // fill point every 1 mm
                    // if(step < 1) step = 1;
                    // for(let k=1; k<=step; k++){ 
                    //     let step_angle_b = angle_b*(k/step);
                    //     m1.makeRotationY(step_angle_b); 
                    //     v2.copy(v1).applyMatrix4(m1);
                    //     //rpts.push(v2.clone());
                    //     gpts.push(v2.clone());
                    //     code += 'G1 X'+d.rnd(v2.x) + ' Y'+d.rnd(v2.y)+ ' Z'+d.rnd(v2.z);
                    //     code += ' A'+0+ ' B'+d.rnd(MathUtils.radToDeg(base_angle_b + step_angle_b));
                    //     code += ' F1000'; // mm per minute
                    //     code += '\r\n';
                    // }