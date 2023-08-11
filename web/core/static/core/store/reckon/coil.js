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
const axis = new Vector3();
const ortho1 = new Vector3();
const ortho2 = new Vector3();
const v_sum = new Vector3();
const l1 = new Line3();
const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);
const m2 = new Matrix4();
const pl1 = new Plane();
const back = new Vector3(0,0,-1);

//const rot_res = 200;
//const rot_step = Math.PI*2/rot_res;
const span = 5; 
const origin_surface_res = 400;
const surface_res = 900;
const max_shift = 0.1;

const min_point_span = 1;

const feed = 30; // mm per second
const start_offset = -10;
const hx = -835;
const hy = -5;
const hz = -674;



// for(let i=0; i<origin_res; i++){
//     origin.push({pts:new Vector3(), count});
// }
// const surf_data = [];
// for(let i=0; i<surface_res*surface_res; i++){
//     surf_data.push({v: new Vector3(), n: new Vector3(), o:0});
// }


export const coil = {
    node(d, n){
        try{
            console.log('Compute Coil');
            delete d.n[n].c.g_code;
            delete d.n[n].c.curve;
            delete d.n[n].ax.curve;
            const c = d.reckon.v(d, n, 'axis_x axis_y axis_z');
            axis.set(c.axis_x, c.axis_y, c.axis_z);
            ortho1.set(c.axis_z, c.axis_x, c.axis_y);
            ortho2.copy(axis).cross(ortho1);
            const surfaces  = d.n[n].n.surface.map(surface=> d.n[surface].c.surface);
            const pivots = {};
            surfaces.forEach((surface, si) => {
                for(let u=0; u<origin_surface_res; u++){
                    for(let v=0; v<origin_surface_res; v++){ 
                        surface.get_point(u/origin_surface_res, v/origin_surface_res, v1);
                        v2.copy(v1).projectOnVector(axis);
                        //console.log(v1);
                        
                        let k = 'k'+Math.round(v2.length()*Math.sign(v2.dot(axis)));
                        //console.log(k);
                        if(!pivots[k]) pivots[k] = {b:new Box3(), v: new Vector3()};
                        pivots[k].b.expandByPoint(v1);
                        //pivots[k].c++;
                    }
                }
            });
            Object.values(pivots).forEach(pivot=> pivot.b.getCenter(pivot.v));
            const surf_data = [];
            surfaces.forEach(surface => {
                for(let u=0; u<surface_res; u++){
                    for(let v=0; v<surface_res; v++){ 
                        surface.get_point_normal(u/surface_res, v/surface_res, v1, v9);
                        v2.copy(v1).projectOnVector(axis); // axis point
                        let axis_pos = v2.length()*Math.sign(v2.dot(axis));
                        let pivot = pivots['k'+Math.round(axis_pos)].v;  // get pivot
                        v4.copy(v1).sub(pivot); // vector from pivot to surface point
                        var angle = v4.angleTo(ortho1) * Math.sign(v4.dot(ortho2)); 
                        if(angle < 0) angle += Math.PI*2;
                        var shift = -((axis_pos + (angle/(Math.PI*2))*span) % span); // remainder
                        if (shift < -span/2) shift += span;
                        if(Math.abs(shift) < max_shift){
                            v7.copy(axis).multiplyScalar(shift); // shift along axis vector to align with coil
                            v8.copy(v1).add(v7); // new surface point
                            surf_data.push({v:v8.clone(), n:v9.clone(), o:axis_pos+shift});
                        }
                    }
                }
            });
            console.log('Compute Coil Phase 2');
            surf_data.sort((a,b)=> a.o-b.o);
            console.log('Compute Coil Phase 3');

            var curve = new CurvePath();
            curve.arcLengthDivisions = 2000;
            //var curve2 = new CurvePath(); 
            //curve2.arcLengthDivisions = 2000;
            var pts = [surf_data[0].v];
            var nml = [surf_data[0].n];
            var nml2 = [surf_data[0].n];
            var surface_dists = [0];
            var last_point = surf_data[0].v;
            for(let i=0; i<surf_data.length; i++){ 
                let dist = last_point.distanceTo(surf_data[i].v);
                if(dist > min_point_span){
                    pts.push(surf_data[i].v);
                    nml.push(surf_data[i].n);
                    nml2.push(surf_data[i].n.clone());
                    surface_dists.push(dist);
                    curve.add(new LineCurve3(last_point, surf_data[i].v));
                    last_point = surf_data[i].v;
                    //curve2.add(new LineCurve3(surf_data[i].v, surf_data[i+1].v)); 
                } 
            }

            console.log('Compute Coil Phase 4');


            // const tpl = {};
            // for(let i=0; i<tests.length; i++){
            //     var idx = Math.round(tests[i].p.y*3);
            //     if(tpl['l'+idx] == undefined) tpl['l'+idx] = [];//{pts:[], sort_count:-1};
            //     tpl['l'+idx].push(tests[i]);
            // }
            // var pts = [];
            // var nml = [];
            // var nml2 = [];
            // var surface_dists = [0];
            // surfaces[0].get_point(1, 0, v1);
            // var y = v1.y;
            // origin.set(0,y,-1000);
            // destination.set(0,y,0);//.sub(origin);
            // axis.set(0,y,0);
            // var curve2 = new CurvePath();//new CatmullRomCurve3(pts);
            // curve2.arcLengthDivisions = 2000;
            // for(let i=0; i<10000; i++){ 
            //     v_sum.set(0,0,0);
            //     for(let k=0; k<rot_res; k++){ 
            //         l1.set(origin, destination);
            //         const ry = Math.round(y*3);
            //         if(!tpl['l'+ry]) break;
            //         var spt = null;
            //         spt = tpl['l'+ry].sort((a,b)=>{
            //             l1.closestPointToPoint(a.p, true, v1);
            //             l1.closestPointToPoint(b.p, true, v2);
            //             return v1.distanceTo(a.p)-v2.distanceTo(b.p);
            //         });
            //         tpl['l'+ry].sort_count = 0;
            //         // if(spt[0].uu+.001 > 1) var uuu = spt[0].uu-.001
            //         // else var uuu = spt[0].uu+.001;
            //         // if(spt[0].vv+.001 > 1) var vvv = spt[0].vv-.001
            //         // else var vvv = spt[0].vv+.001;
            //         //surfaces[spt[0].si].get_point(spt[0].uu+.001, spt[0].vv,      v1);
            //         //surfaces[spt[0].si].get_point(spt[0].uu,      spt[0].vv+.001, v2);
            //         //plane.setFromCoplanarPoints(spt[0].p, v1, v2);
            //         surfaces[spt[0].si].get_point_plane(spt[0].uu, spt[0].vv, v1, plane);
            //         plane.intersectLine(l1, v1);
            //         pts.push(v1.clone());
            //         let normal = plane.normal.clone();
            //         if(v3.copy(destination).sub(origin).dot(normal) > 0) normal.negate();
            //         nml.push(normal);//.add(v1)); // does it need to be clone ?!?!?!?!?!
            //         nml2.push(normal.clone()); 
            //         if(pts.length > 1) surface_dists.push(pts.at(-2).distanceTo(pts.at(-1)));
            //         if(pts.length > 1) curve2.add(new LineCurve3(pts.at(-2).clone(), pts.at(-1).clone()));
            //         v_sum.add(v1);
            //         y -= span / rot_res;
            //         origin.set(0, 0, -1000);
            //         origin.applyMatrix4(m1.makeRotationY(-rot_step*k));
            //         origin.add(axis);
            //         origin.setY(y);
            //         destination.set(axis.x, y, axis.z);
            //     }
            //     if(y < bb1.min.y+4) break;
            //     v_sum.divideScalar(rot_res);
            //     axis.copy(v_sum);
            // }
            console.log('Compute Coil Phase 3');
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

            // /////////////////////////////// TRANSFORM TO 5-AXIS /////////////////////////////////////////////////////
            var smooth_range = 8;
            for(let i=smooth_range; i<nml.length-smooth_range; i++){ 
                for(let k=-smooth_range; k<=smooth_range; k++){ 
                    if(k != 0) nml[i].add(nml2[i+k]);
                }
                nml[i].divideScalar(smooth_range*2 + 1);
            }
            var angle_a = -58;
            var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
            code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
            code += 'G0 X'+hx+' Y-300 A'+angle_a+' \r\n';
            code += 'G0 Z'+(hz-pts[0].z-start_offset)+' \r\n';
            code += 'G0 Y'+hy+' \r\n';
            code += 'G1 Z'+(hz-pts[0].z)+' F30 \r\n \r\n';
            var total_angle_b = 0;
            //var rpts = [];
            //var gpts = [];
            //var dir = new Vector3(-1,0,0);
            for(let i=1; i<pts.length; i++){ 
                //let surface_dist = 
                v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
                let angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
                //v1.copy(pts[i]);
                m1.makeRotationY(angle_b); 
                pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
                //var base_angle_b = total_angle_b;
                total_angle_b += angle_b;
                if(i < pts.length-1){
                    m1.makeRotationY(total_angle_b);
                    pts[i+1].applyMatrix4(m1);
                    nml[i+1].applyMatrix4(m1);
                }
                //var add_points = true;
                // if(gpts.length > 0){
                //     v3.copy(pts[i]).sub(gpts.at(-1));
                //     if(dir.dot(v3) < 0.5) add_points = false;
                //     dir.copy(v3);
                // }
                //if(add_points){
                    //gpts.push(pts[i]);
                    //let gantry_dist = Math.round(pts[i-1].distanceTo(pts[i]));
                    // home is -1000 for X and Z //home is 0 for Y !!!!!!
                    //For tool +Z at center top of rod: X:-835, Y:-5, Z:-674, A:-58, B:0
                    if(surface_dists[i] == 0) continue;
                    code += 'G1 X'+d.rnd(hx+pts[i].x, 1000) + ' Y'+d.rnd(hy-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(hz-pts[i].z, 1000);
                    //-58 points tool to +Z //-148 tool points +Y //-238 points tool to -Z //0 is limit switch  //positive moves in clockwize if looking along +x
                    code += ' A'+d.rnd(angle_a, 1000); 
                    code += ' B'+d.rnd(MathUtils.radToDeg(-total_angle_b), 1000);
                    code += ' F'+d.rnd(feed/surface_dists[i]*60, 1000); 
                    code += '\r\n';
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
                //}
            }
            // //////////////////////////////////////

            //gpts = simplify(gpts, rpts, 0.4); // need to figure out which ones got deleted so they can be removed from g code ?!?!?!?!?!


            


            d.n[n].c.code = code;
            d.n[n].c.curve = curve;
            d.n[n].ax.curve = curve; // make curve an array of auxiliary curves ?!?!?!?!?!
            //d.n[n].ax.curve2 = curve2; 
            console.log('Reckoned Coil!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};



// surfaces.forEach((surface, si) => {
//     for(let v=0; v<surface_res; v++){ 
//         for(let u=0; u<surface_res; u++){
//             var test = {p: new Vector3(), u:u, v:v, uu:1-u/surface_res, vv:v/surface_res, si:si};
//             tests.push(test);
//             surface.get_point(test.uu, test.vv, test.p);
//             bb1.expandByPoint(test.p);
//         }
//     }
// });

// const tpl = {};
//             for(let i=0; i<tests.length; i++){
//                 var idx = Math.round(tests[i].p.y*3);
//                 if(tpl['l'+idx] == undefined) tpl['l'+idx] = [];//{pts:[], sort_count:-1};
//                 tpl['l'+idx].push(tests[i]);
//             }
//             console.log('Compute Coil Phase 2');
//             var pts = [];
//             var nml = [];
//             var nml2 = [];
//             var surface_dists = [0];
//             surfaces[0].get_point(1, 0, v1);
//             var y = v1.y;
//             origin.set(0,y,-1000);
//             destination.set(0,y,0);//.sub(origin);
//             axis.set(0,y,0);
//             var curve2 = new CurvePath();//new CatmullRomCurve3(pts);
//             curve2.arcLengthDivisions = 2000;
//             for(let i=0; i<10000; i++){ 
//                 v_sum.set(0,0,0);
//                 for(let k=0; k<rot_res; k++){ 
//                     l1.set(origin, destination);
//                     const ry = Math.round(y*3);
//                     if(!tpl['l'+ry]) break;
//                     var spt = null;
//                     spt = tpl['l'+ry].sort((a,b)=>{
//                         l1.closestPointToPoint(a.p, true, v1);
//                         l1.closestPointToPoint(b.p, true, v2);
//                         return v1.distanceTo(a.p)-v2.distanceTo(b.p);
//                     });
//                     tpl['l'+ry].sort_count = 0;
//                     // if(spt[0].uu+.001 > 1) var uuu = spt[0].uu-.001
//                     // else var uuu = spt[0].uu+.001;
//                     // if(spt[0].vv+.001 > 1) var vvv = spt[0].vv-.001
//                     // else var vvv = spt[0].vv+.001;
//                     surfaces[spt[0].si].get_point(spt[0].uu+.001, spt[0].vv,      v1);
//                     surfaces[spt[0].si].get_point(spt[0].uu,      spt[0].vv+.001, v2);
//                     plane.setFromCoplanarPoints(spt[0].p, v1, v2);
//                     plane.intersectLine(l1, v1);
//                     pts.push(v1.clone());
//                     let normal = plane.normal.clone();
//                     if(v3.copy(destination).sub(origin).dot(normal) > 0) normal.negate();
//                     nml.push(normal);//.add(v1)); // does it need to be clone ?!?!?!?!?!
//                     nml2.push(normal.clone()); 
//                     if(pts.length > 1) surface_dists.push(pts.at(-2).distanceTo(pts.at(-1)));
//                     if(pts.length > 1) curve2.add(new LineCurve3(pts.at(-2).clone(), pts.at(-1).clone()));
//                     v_sum.add(v1);
//                     y -= layer_height / rot_res;
//                     origin.set(0, 0, -1000);
//                     origin.applyMatrix4(m1.makeRotationY(-rot_step*k));
//                     origin.add(axis);
//                     origin.setY(y);
//                     destination.set(axis.x, y, axis.z);
//                 }
//                 if(y < bb1.min.y+4) break;
//                 v_sum.divideScalar(rot_res);
//                 axis.copy(v_sum);
//             }






// function simplify(curve, points, threshold) {
//     if (curve.length <= 2) return curve;
  
//   if (curve.length != points.length) {
//   	throw `curve.length=${curve.length} not equals to points.length=${points.length}`;
//   }

// 	const thresholdSq = threshold * threshold;
  
//   const result = [curve[0]];
  
//   simplifySegment(0, curve.length - 1);
//   result.push(curve[curve.length - 1]);
  
//   return result;
  
//   function simplifySegment(iLeft, iRight) {
//   	if (iRight - iLeft <= 1) return;
    
//     const ray = new Ray(
//     	points[iLeft],
//       points[iRight].clone().sub(points[iLeft]).normalize()
//     );
    
//     let maxDistSq = 0;
//     let maxIndex = iLeft;
//     for (let i = iLeft + 1; i < iRight; i++) {
//     	const distSq = ray.distanceSqToPoint(points[i]);
//       if (distSq > thresholdSq && distSq > maxDistSq) {
//       	maxDistSq = distSq;
//         maxIndex = i;
//       }
//     }
    
//     if (maxIndex != iLeft) {
//       simplifySegment(iLeft, maxIndex);
//       result.push(curve[maxIndex]);
//       simplifySegment(maxIndex, iRight);
//     }
//   }
// }



// var code = '';
//             var total_angle_b = 0;
//             //v2.copy(pts[0]);
//             for(let i=0; i<pts.length; i++){ //pts.length
//                 v1.set(nml[i].x, 0, nml[i].z);
//                 //console.log(v1.clone());
//                 //console.log(back.clone());
//                 let angle_b = back.angleTo(v1) * Math.sign(nml[i].x);
//                 // if(i < pts.length-1 && angle_b > 0.5){
//                 //     pts[i+1].applyMatrix4(m2);
//                 //     nml[i+1].applyMatrix4(m2);
//                 //     continue;
//                 // }
//                 total_angle_b += angle_b;
//                 //console.log(angle_b);
//                 m1.makeRotationY(angle_b); //Vector3.applyAxisAngle 
//                 m2.makeRotationY(total_angle_b);
//                 pts[i].applyMatrix4(m2);
//                 //v2.copy(pts[i]);
//                 //v2.applyMatrix4(m1);
//                 //nml[i  ].applyMatrix4(m1);
//                 if(i < pts.length-1){
//                     //pts[i+1].applyMatrix4(m2);
//                     nml[i+1].applyMatrix4(m2);
//                 }
//                 code += 'G1 X'+d.rnd(pts[i].x) + ' Y'+d.rnd(pts[i].y)+ ' Z'+d.rnd(pts[i].z);
//                 code += ' A'+0+ ' B'+d.rnd(MathUtils.radToDeg(total_angle_b));
//                 code += ' F1000'; // mm per minute
//                 code += '\r\n';
//             }



//pts = curve.getPoints(Math.round(curve.getLength()*code_res));


//if(plane.intersectsLine(l1)) plane.intersectLine(l1, v1)
                    //else v1.copy(spt[0].p);

//const res_u = 200;
// const tests = [];
// for(let v=0; v<res_v; v++){
//     tests[v] = [];
//     for(let u=0; u<res_u; u++){
//         tests[v][u] = {p: new Vector3(), u:u, v:v, uu:1-u/res_u, vv:v/res_v};
//     }
// }

// const v1 = new Vector3();
// const v2 = new Vector3();
// const v3 = new Vector3();
// const z_dir = new Vector3(0,0,1);
// const axis = new Vector3();
// const v_sum = new Vector3();

// const l1 = new Line3();
// //const v_count = 0;

// const res_v = 300;
// const res_u = 400;
// const tests = [];
// //const coarse_tests = [];
// //const u_idx = [];
// for(let v=0; v<res_v; v++){
//     tests[v] = [];
//     //if(v%10 == 0) course_tests[v/10] = [];
//     //u_idx.push(0);
//     for(let u=0; u<res_u; u++){
//         tests[v][u] = {p: new Vector3(), u:u, v:v, uu:1-u/res_u, vv:v/res_v};
//         //if(v%20 == 0 && u%20 == 0) coarse_tests.push(tests[v][u]);//[v/10][u/10] = tests[v][u];
//     }
// }
// //console.log(coarse_tests.length);

// const origin = new Vector3();
// const destination = new Vector3();
// //const raycaster = new Raycaster();
// //const material = new MeshBasicMaterial();

// //const geo_res = 50;
// const rot_res = 80;
// const rot_step = Math.PI*2/rot_res;
// // const target_angles = [];
// // for(let i=0; i<rot_res; i++){
// //     target_angles.push(rot_step*i);
// // }
// // for(let i=rot_res; i>0; i--){
// //     target_angles.push(rot_step*i);
// // }
// // console.log('target_angles');
// // console.log(target_angles);
// const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);
// const plane = new Plane();

// // const local_res = 0.005;
// // const local_size = 40;
// // const local_offset = local_size*local_res/2;
// // const local_points = [];
// // for(let u=0; u<local_size; u++){
// //     local_points[u] = [];
// //     for(let v=0; v<local_size; v++){
// //         local_points[u][v] = {p: new Vector3(10000,10000,10000), u:0, v:0};
// //     }
// // }



// const layer_height = 2;

// export const coil = {
    
//     code_res: .2, // code_res = arc length between G1 if constant curve like an arc
//     node(d, n){
//         try{
//             console.log('compute coil');
//             //if(d.studio.mode == 'graph') return;
//             delete d.n[n].c.g_code;
//             delete d.n[n].c.curve;
//             delete d.n[n].ax.curve;
//             const surface  = d.n[d.n[n].n.surface[0]].c.surface;
            
//             //const start_y = v1.y;
//             const bb1 = new Box3();
//             for(let v=0; v<res_v; v++){ 
//                 //u_idx[v] = 0;
//                 for(let u=0; u<res_u; u++){
//                     //var uu = 1-u/res_u;
//                     //var vv = v/res_v;
//                     //tests[v][u].uu = uu;
//                     //tests[v][u].vv = vv;
//                     surface.get_point(tests[v][u].uu,      tests[v][u].vv,      tests[v][u].p);
//                     //surface.get_point(uu+.005, vv,      v1);
//                     //surface.get_point(uu,      vv+.005, v2);
//                     //tests[v][u].n.copy(tests[v][u].p).add(v1.sub(tests[v][u].p).cross(v2.sub(tests[v][u].p)).normalize());
//                     bb1.expandByPoint(tests[v][u].p);
//                     //surface.get_point(1-u*res_u, v*res_v, tests[v][u].p);
                    
//                 }
//             }
//             const test_points = tests.flat();//.sort((a,b)=> a.y-b.y);
//             const tpl = {};
//             // for(let i=-1000; i<1000; i++){
//             //     tpl.push([]);
//             // }
//             for(let i=0; i<test_points.length; i++){
//                 var idx = Math.round(test_points[i].p.y/2);
//                 if(tpl['l'+idx] == undefined) tpl['l'+idx] = [];//{pts:[], sort_count:-1};
//                 tpl['l'+idx].push(test_points[i]);
//             }
//             //console.log(tpl);


//             // const geo_obj = new Mesh(
//             //     new ParametricGeometry(surface.get_point, geo_res, geo_res),
//             //     material
//             // );
//             console.log('compute coil phase 2');
//             var pts = [];
//             //var u = 1;
//             //var v = 0;
//             surface.get_point(1, 0, v1);
//             var y = v1.y;
//             origin.set(0,y,1000);
//             destination.set(0,y,0);//.sub(origin);
//             axis.set(0,y,0);
//             //var prev_level = null;
//             for(let i=0; i<10000; i++){ 
//                 v_sum.set(0,0,0);
//                 for(let k=0; k<rot_res; k++){ 
//                     l1.set(origin, destination);
//                     const ry = Math.round(y/2);
//                     if(!tpl['l'+ry]) break;
//                     var spt = null;
//                     //if(tpl['l'+ry].sort_count > 5 || tpl['l'+ry].sort_count == -1 || ry != prev_level){
//                         spt = tpl['l'+ry].sort((a,b)=>{
//                             l1.closestPointToPoint(a.p, true, v1);
//                             l1.closestPointToPoint(b.p, true, v2);
//                             return v1.distanceTo(a.p)-v2.distanceTo(b.p);
//                         });
//                         tpl['l'+ry].sort_count = 0;
//                     // }else{
//                     //     spt = tpl['l'+ry].pts.slice(0,100).sort((a,b)=>{
//                     //         l1.closestPointToPoint(a.p, true, v1);
//                     //         l1.closestPointToPoint(b.p, true, v2);
//                     //         return v1.distanceTo(a.p)-v2.distanceTo(b.p);
//                     //     });
//                     // }
//                     // tpl['l'+ry].sort_count += 1;
//                     // prev_level = ry;

//                     //var fine_test = tests.slice();

//                     surface.get_point(spt[0].uu+.004, spt[0].vv,      v1);
//                     surface.get_point(spt[0].uu,      spt[0].vv+.004, v2);
//                     plane.setFromCoplanarPoints(spt[0].p, v1, v2);
//                     if(plane.intersectsLine(l1)) plane.intersectLine(l1, v1)
//                     else v1.copy(spt[0].p);
//                     //console.log(pt);
                    
//                     pts.push(v1.clone());
//                     v_sum.add(v1);
//                     y -= layer_height / rot_res;
//                     //origin.set(axis.x, y, axis.z+1000);
//                     origin.set(0, 0, 1000);
//                     origin.applyMatrix4(m1.makeRotationY(rot_step*k));
//                     origin.add(axis);
//                     origin.setY(y);
//                     destination.set(axis.x, y, axis.z);//.sub(origin);
//                 }
//                 if(y < bb1.min.y) break;
//                 // Object.entries(tpl).forEach(test_point_level=>{
//                 //     test_point_level.sort_count = -1;
//                 // });
//                 v_sum.divideScalar(rot_res);
//                 axis.copy(v_sum);
//             }

//             console.log('compute coil phase 3');

//             const curve = new CatmullRomCurve3(pts);
//             curve.arcLengthDivisions = 3000;
            
//             var code = '';
//             // pts = curve.getPoints(Math.round(curve.getLength()*this.code_res));
//             // for(let i=0; i<pts.length; i++){
//             //     code += 'G0 X'+d.rnd(pts[i].x) + ' Y'+d.rnd(pts[i].y)+ ' Z'+d.rnd(pts[i].z) + '\r\n';
//             // }

//             d.n[n].c.code = code;
//             d.n[n].c.curve = curve;
//             d.n[n].ax.curve = d.n[n].c.curve;
//             console.log('Reckoned coil!!!');
//         }catch(e){
//             console.log(e);
//         } 
//     }, 
// };






//var tp = [];
                    //if(tpl['l'+ry]) tp = tpl['l'+ry].points;
                    //for(let idx=ry-1; idx<=ry+1; idx++){
                    //   if(tpl['l'+idx]) tp = tp.concat(tpl['l'+idx]);
                    //}
                    //console.log(tp);
                    //if(tp.length < 1){
                    //    console.log('no test level found!!!');
                    //    break;
                    //}


//if(a.n.dot(l1.delta(v3)) > 0) l1.closestPointToPoint(a.p, false, v1)
                        //else return 1;//v1.set(10000,10000,10000);
                        //if(b.n.dot(l1.delta(v3)) > 0) l1.closestPointToPoint(b.p, false, v2);
                        //else return -1;//v2.set(10000,10000,10000);

// var pts = [];
//             //var u = 1;
//             //var v = 0;
//             surface.get_point(1, 0, v1);
//             var y = v1.y;
//             origin.set(0,y,1000);
//             direction.set(0,y,0).sub(origin);
//             axis.set(0,y,0);
//             for(let i=0; i<10000; i++){ 
//                 v_sum.set(0,0,0);
//                 for(let k=0; k<rot_res; k++){ 
//                     raycaster.set(origin, direction);
//                     const intersects = raycaster.intersectObject(geo_obj);
//                     if(intersects.length > 0){
//                         pts.push(intersects[0].point);
//                         v_sum.add(intersects[0].point);
//                         if(intersects.length > 1) console.log('two hits!!!');
//                     }
//                     y -= layer_height / rot_res;
//                     if(y < bb1.min.y) break;
//                     origin.set(axis.x, y, axis.z+1000);
//                     origin.applyMatrix4(m1.makeRotationY(rot_step*k));
//                     direction.set(axis.x,y,axis.z).sub(origin);
//                 }
//                 v_sum.divideScalar(rot_res);
//                 axis.copy(v_sum);
//             }


// const geo_obj = new Mesh(
//     new ParametricGeometry(surface.get_point, geo_res, geo_res),
//     material
// );
// var y = start_y;
// origin.set(0,y,1000);
// direction.set(0,y,0).sub(origin);
// for(let i=0; i<10000; i++){
//     raycaster.set(origin, direction);
//     const intersects = raycaster.intersectObject(geo_obj);
//     if(intersects.length > 0){
//         pts.push(intersects[0].point);
//         if(intersects.length > 1) console.log('two hits!!!');
//     }
//     y -= layer_height / rot_res;
//     if(y < bb1.min.y) break;
//     origin.applyMatrix4(rotation);
//     direction.set(0,y,0).sub(origin);
// }



// const geo_obj = new Mesh(
//     new ParametricGeometry(surface.get_point, geo_res, geo_res),
//     material
// );
// var y = start_y;
// origin.set(0,y,1000);
// direction.set(0,y,0).sub(origin);
// for(let i=0; i<10000; i++){
//     raycaster.set(origin, direction);
//     const intersects = raycaster.intersectObject(geo_obj);
//     if(intersects.length > 0){
//         pts.push(intersects[0].point);
//         if(intersects.length > 1) console.log('two hits!!!');
//     }
//     y -= layer_height / rot_res;
//     if(y < bb1.min.y) break;
//     origin.applyMatrix4(rotation);
//     direction.set(0,y,0).sub(origin);
// }


            // var layer_count = 0;
            // var ty = start_y;
            // for(let i=0; i<10000; i++){
            //     for(let v=0; v<1/res_v; v++){
            //         ty = start_y - (layer_count * this.layer_height + this.layer_height * v*res_v);
            //         //var v2 = tests[v].slice(u_idx[v], u_idx[v]+50).sort((a,b)=> Math.abs(a.y-ty)-Math.abs(b.y-ty))[0]; // Don't need to sort this ?!?!?!?!?! instead, just search down u from last time at this v
            //         //var v2 = tests[v][u_idx[v]];
            //         var pt = tests[v].sort((a,b)=> Math.abs(a.y-ty)-Math.abs(b.y-ty))[0];
            //         //if(Math.abs(pt.y-ty) < this.layer_height/2){
            //             pts.push(pt.clone());
            //             //u_idx[v]++;
            //             // flag start or stop extrude
            //         //}
                    
            //     }
            //     if(ty < bb1.min.y) break;
            //     layer_count++;
            // }


// for(let u=0; u<1; u+=this.res){
//     for(let v=0; v<1; v+=this.res){
//         surface.get_point(u, v, v1);
//         pts.push(v1.clone());
//     }
// }




// var pts = [];
//             //var u = 1;
//             //var v = 0;
//             surface.get_point(u, v, v1);
//             var y = v1.y;
//             axis.set(0,y,0);
//             for(let i=0; i<10000; i++){ 
//                 v_sum.set(0,0,0);
//                 target_angles.forEach(target_angle => {
//                     for(let uu=0; uu<local_size; uu++){
//                         for(let vv=0; vv<local_size; vv++){ 
//                             local_points[uu][vv].u = u-local_offset+(uu*local_res);
//                             local_points[uu][vv].v = v-local_offset+(vv*local_res);
//                             if(local_points[uu][vv].u >= 0 && local_points[uu][vv].u <= 1){
//                                 if(local_points[uu][vv].v >= 0 && local_points[uu][vv].v <= 1){
//                                     surface.get_point(local_points[uu][vv].u, local_points[uu][vv].v, local_points[uu][vv].p);
                                    
//                                 }
//                             }
//                         }
//                     }
//                     var best_fit = local_points.flat().sort((a,b)=>{
//                         v1.set(axis.x, a.p.y, axis.z);
//                         v2.set(axis.x, b.p.y, axis.z);
//                         var angle_a = z_dir.angleTo(v3.copy(a.p).sub(v1)); 
//                         var angle_b = z_dir.angleTo(v3.copy(b.p).sub(v2)); 
//                         return (Math.abs(a.p.y-y)+Math.abs(angle_a-target_angle)) - (Math.abs(b.p.y-y)+Math.abs(angle_b-target_angle));
//                     })[0];
//                     pts.push(best_fit.p.clone());
//                     v_sum.add(local_points[uu][vv].p);
//                     u = best_fit.u;
//                     v = best_fit.v; 
//                     y -= layer_height / target_angles.length;
//                 });
//                 if(y < bb1.min.y) break;
//                 v_sum.divideScalar(target_angles.length);
//                 axis.copy(v_sum);
//             }