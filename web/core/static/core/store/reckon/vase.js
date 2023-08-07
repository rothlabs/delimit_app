import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, CatmullRomCurve3, Box3, Raycaster, Mesh, MeshBasicMaterial, Line3, Plane, LineCurve3, CurvePath} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const axis = new Vector3();
const v_sum = new Vector3();
const l1 = new Line3();
const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);
const m2 = new Matrix4();
const plane = new Plane();
const origin = new Vector3();
const destination = new Vector3();
const back = new Vector3(0,0,-1);

const rot_res = 160;
const rot_step = Math.PI*2/rot_res;
const layer_height = 5;
const surface_res = 200;
const code_res = .2; 

export const vase = {
    node(d, n){
        try{
            console.log('Compute Vase');
            //if(d.studio.mode == 'graph') return;
            delete d.n[n].c.g_code;
            delete d.n[n].c.curve;
            delete d.n[n].ax.curve;
            //const surface  = d.n[d.n[n].n.surface[0]].c.surface;
            const surfaces  = d.n[n].n.surface.map(surface=> d.n[surface].c.surface);
            const bb1 = new Box3();
            const tests = [];
            surfaces.forEach((surface, si) => {
                for(let v=0; v<surface_res; v++){ 
                    for(let u=0; u<surface_res; u++){
                        var test = {p: new Vector3(), u:u, v:v, uu:1-u/surface_res, vv:v/surface_res, si:si};
                        tests.push(test);
                        surface.get_point(test.uu, test.vv, test.p);
                        bb1.expandByPoint(test.p);
                    }
                }
            });
            const tpl = {};
            for(let i=0; i<tests.length; i++){
                var idx = Math.round(tests[i].p.y/2);
                if(tpl['l'+idx] == undefined) tpl['l'+idx] = [];//{pts:[], sort_count:-1};
                tpl['l'+idx].push(tests[i]);
            }
            console.log('Compute Vase Phase 2');
            var pts = [];
            var nml = [];
            surfaces[0].get_point(1, 0, v1);
            var y = v1.y;
            origin.set(0,y,-1000);
            destination.set(0,y,0);//.sub(origin);
            axis.set(0,y,0);
            const curve = new CurvePath();//new CatmullRomCurve3(pts);
            curve.arcLengthDivisions = 1000;
            for(let i=0; i<10000; i++){ 
                v_sum.set(0,0,0);
                for(let k=0; k<rot_res; k++){ 
                    l1.set(origin, destination);
                    const ry = Math.round(y/2);
                    if(!tpl['l'+ry]) break;
                    var spt = null;
                    spt = tpl['l'+ry].sort((a,b)=>{
                        l1.closestPointToPoint(a.p, true, v1);
                        l1.closestPointToPoint(b.p, true, v2);
                        return v1.distanceTo(a.p)-v2.distanceTo(b.p);
                    });
                    tpl['l'+ry].sort_count = 0;
                    // if(spt[0].uu+.001 > 1) var uuu = spt[0].uu-.001
                    // else var uuu = spt[0].uu+.001;
                    // if(spt[0].vv+.001 > 1) var vvv = spt[0].vv-.001
                    // else var vvv = spt[0].vv+.001;
                    surfaces[spt[0].si].get_point(spt[0].uu+.001, spt[0].vv,      v1);
                    surfaces[spt[0].si].get_point(spt[0].uu,      spt[0].vv+.001, v2);
                    plane.setFromCoplanarPoints(spt[0].p, v1, v2);
                    plane.intersectLine(l1, v1);
                    pts.push(v1.clone());
                    let normal = plane.normal.clone();
                    if(v3.copy(destination).sub(origin).dot(normal) > 0) normal.negate();
                    nml.push(normal); // does it need to be clone ?!?!?!?!?!
                    if(pts.length > 1) curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
                    v_sum.add(v1);
                    y -= layer_height / rot_res;
                    origin.set(0, 0, -1000);
                    origin.applyMatrix4(m1.makeRotationY(rot_step*k));
                    origin.add(axis);
                    origin.setY(y);
                    destination.set(axis.x, y, axis.z);
                }
                if(y < bb1.min.y+4) break;
                v_sum.divideScalar(rot_res);
                axis.copy(v_sum);
            }
            console.log('Compute Vase Phase 3');
            //const curve = new LineCurve3(pts);//new CatmullRomCurve3(pts);
            //curve.arcLengthDivisions = 1000;
            //const nml_curve = new CatmullRomCurve3(nml);
            //nml_curve.arcLengthDivisions = 1000;
            //pts = pts.map(p=> p.clone());

            var code = '';
            var total_angle_b = 0;
            //v2.copy(pts[0]);
            for(let i=0; i<pts.length; i++){ //pts.length
                v1.set(nml[i].x, 0, nml[i].z);
                //console.log(v1.clone());
                //console.log(back.clone());
                let angle_b = back.angleTo(v1) * Math.sign(nml[i].x);
                // if(i < pts.length-1 && angle_b > 0.5){
                //     pts[i+1].applyMatrix4(m2);
                //     nml[i+1].applyMatrix4(m2);
                //     continue;
                // }
                total_angle_b += angle_b;
                //console.log(angle_b);
                m1.makeRotationY(angle_b); //Vector3.applyAxisAngle 
                m2.makeRotationY(total_angle_b);
                pts[i].applyMatrix4(m2);
                //v2.copy(pts[i]);
                //v2.applyMatrix4(m1);
                //nml[i  ].applyMatrix4(m1);
                if(i < pts.length-1){
                    //pts[i+1].applyMatrix4(m2);
                    nml[i+1].applyMatrix4(m2);
                }
                code += 'G1 X'+d.rnd(pts[i].x) + ' Y'+d.rnd(pts[i].y)+ ' Z'+d.rnd(pts[i].z);
                code += ' A'+0+ ' B'+d.rnd(MathUtils.radToDeg(total_angle_b));
                code += ' F1000'; // mm per minute
                code += '\r\n';
            }


            d.n[n].c.code = code;
            d.n[n].c.curve = curve;
            d.n[n].ax.curve = d.n[n].c.curve;
            console.log('Reckoned vase!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};



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

// export const vase = {
    
//     code_res: .2, // code_res = arc length between G1 if constant curve like an arc
//     node(d, n){
//         try{
//             console.log('compute vase');
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
//             console.log('compute vase phase 2');
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

//             console.log('compute vase phase 3');

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
//             console.log('Reckoned vase!!!');
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