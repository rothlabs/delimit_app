import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, LineCurve3, CurvePath} from 'three';

////////////////////////////////  Machine Data //////////////////////
// Home is -1000 for X and Z 
// Home is 0 for Y
// For tool +Z at center top of rod: X:-835, Y:-5, Z:-674, A:-58, B:0
// A-Axis:
    //0 is limit switch 
    //-58 aims tool to +Z 
    //-148 tool aims +Y 
    //-238 aims tool to -Z  
/////////////////////////////////////////////////////////////////////

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const v5 = new Vector3();
const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);
const back = new Vector3(0,0,-1);
const down = new Vector3(0,-1,0);

const ribbon_div = 2;
const normal_smooth_span = 8; // mm
//const ribbon_div = 2;

// machine space, absolute:
const xh   = -835;   
const yh   = -15; // -5 is okay     
const zh   = -672; // prev -674 
const a_pz = -58;
const a_py = -148;

// model space, relative:
const z_start = -40; 
const pulloff = 50; // along surface normal


export const post = {
    node(d, n, a={}){ // make wrapper function to inser c and ax on every node reckon function ?!?!?!?!?! 
        try{
            const c = d.n[n].c;
            const ax = d.n[n].ax;
            delete c.code;
            delete c.surface;
            delete ax.curve;
            
            var paths = [];
            function get_paths(nn){ // make this a general recursive func for getting all of some name #1
                const path_nodes = [];
                d.node.for_n(d, nn, (r,nnn)=>{
                    if(d.n[nnn].c.paths != undefined){
                        paths = paths.concat(d.n[nnn].c.paths);
                        path_nodes.push(nnn);
                    }
                });
                path_nodes.forEach(nnn=> get_paths(nnn));
            }
            get_paths(n);

            

            //var total_length = 0;
            //const paths = [];

            
            //v1.set(nml[0].x, 0, nml[0].z);
            //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
            //var axis_a = -58; // tool points Z+
            //var pos = new Vector3();
            var axis_a = 0; 
            var axis_b = 0; // need to set to start of path 
            var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
            code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
            code += 'M3 S0 \r\n';
            code += 'M64 P1 \r\n'; // turn on heat
            code += 'G0 X'+xh+' Y-300 A'+a_pz+' \r\n'; 
            code += 'G0 Z'+(zh-z_start)+' \r\n'; //code += 'G0 Z'+(zh-pts[0].z-z_start)+' \r\n';
            code += 'G0 Y'+yh+' \r\n';
            code += 'G4 P2 \r\n'; // wait 2 seconds for heat to come to temperature
            // code += 'G1 Z'+(zh-pts[0].z)+' F30 \r\n \r\n';

            var offset_y = null;

            const curves = [];
            paths.forEach((path, pi)=>{
                var curve = new CurvePath();
                curve.arcLengthDivisions = 2000;
                curves.push(curve);
                var pts = [];
                var nml = [];
                var dis = [0];
                var n_ref = [];

                //var length = path.ribbon.length_v; //path.curve.getLength(); 
                //total_length += length;
                var res = path.ribbon.length_v / ribbon_div; 
                for(let v=0; v<res; v++){
                    pts.push(new Vector3());
                    nml.push(new Vector3());
                    path.ribbon.get_point(0, v/res, pts.at(-1));
                    path.ribbon.get_point(1, v/res, nml.at(-1));
                    nml.at(-1).sub(pts.at(-1));
                    n_ref.push(nml.at(-1).clone());
                    if(pts.length > 1){
                        curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
                        dis.push(pts.at(-2).distanceTo(pts.at(-1)));
                    }
                }

                var pt_span = curve.getLength() / pts.length;
                var range = Math.round(normal_smooth_span / pt_span / 2) + 1; // remove +1? #2
                for(let i=0; i<nml.length; i++){ 
                    var vc = 1;
                    var rng = range;
                    if(rng > i) rng = i;
                    if(rng > nml.length-1-i) rng = nml.length-1-i;
                    for(let k=-rng; k<=rng; k++){ 
                        if(k != 0 && n_ref[i+k]){
                            nml[i].add(n_ref[i+k]);
                            vc++;
                        }
                    }
                    nml[i].divideScalar(vc);      
                }

                if(offset_y == null) offset_y = -pts[0].y;
                function move(gc, p, a={}){
                    code += gc+' X'+d.rnd(xh+p.x, 1000)+' Y'+d.rnd(yh+offset_y+p.y, 1000)+' Z'+d.rnd(zh-p.z, 1000);
                    if(a.rot){
                        code += ' A'+d.rnd(a_py+MathUtils.radToDeg(-a.rot.a), 1000);
                        code += ' B'+d.rnd(     MathUtils.radToDeg(-a.rot.b), 1000);
                    }
                    if(gc == 'G1') code += ' F'+d.rnd(a.inverse_time, 1000);
                    code += ' \r\n';
                }

                function rotate_point_normal(i, b){
                    m1.makeRotationY(b); // Vector3.applyAxisAngle #2
                    pts[i].applyMatrix4(m1);
                    nml[i].applyMatrix4(m1);
                }

                code += '\r\n (Path '+pi+') \r\n';
                rotate_point_normal(0, axis_b);
                for(let i=0; i<pts.length; i++){ 
                    v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
                    var shift_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
                    rotate_point_normal(i, shift_b);
                    v1.set(0, nml[i].y, nml[i].z); //v1.set(normal.x, 0, normal.z);//
                    axis_a = down.angleTo(v1) * Math.sign(nml[i].z);
                    axis_b += shift_b;
                    if(i == 0){
                        v2.copy(pts[i]).add(v3.copy(nml[i]).multiplyScalar(pulloff));
                        move('G0', v2, {rot:{a:axis_a, b:axis_b}});
                        move('G0', pts[i]);
                        code += 'S'+Math.round(path.flow * path.speed * 10)+' \r\n'; // S1000 = 100m/s extrusion rate
                    }else if(i == pts.length-1){
                        code += 'S0 \r\n';
                        v2.copy(pts[i]).add(v3.copy(nml[i]).multiplyScalar(pulloff));
                        move('G0', v2);
                    }else{
                        move('G1', pts[i], {rot:{a:axis_a, b:axis_b}, inverse_time:(path.speed / dis[i]) * 60});
                    }
                    if(i < pts.length-1) rotate_point_normal(i+1, axis_b);
                    // code += 'G1 X'+d.rnd(xh+pts[i].x, 1000) + ' Y'+d.rnd(yh-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(zh-pts[i].z, 1000);
                    // code += ' A'+d.rnd(angle_a, 1000); 
                    // code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
                    // code += ' F'+d.rnd(path.speed/dis[i]*60, 1000); 
                    // code += '\r\n';
                }

                // code += 'S0\r\n';
                // ribbon.get_point(0, 1, v1); // start point
                // ribbon.get_point(1, 1, v2); v2.sub(v1); // start normal
                // v3.copy(v1).add(v4.copy(v2).multiplyScalar(pulloff));
                // move('G0', v3);


                //paths.push({ribbon:ribbon, speed:path.speed, flow:path.flow});
            });







            c.code = code;
            //c.surface = ribbon;
            ax.curve = curves;
        }catch(e){
            console.log(e);
        } 
    }, 
};




// //             var angle_a = -58; 
//                 // //v1.set(nml[0].x, 0, nml[0].z);
//                 // //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
//                 // var angle_b = 0; // need to set to start of path 
//                 // var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
//                 // code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
//                 // code += 'G0 X'+xh+' Y-300 A'+angle_a+' \r\n';
//                 // code += 'G0 Z'+(zh-pts[0].z-z_start)+' \r\n';
//                 // code += 'G0 Y'+yh+' \r\n';
//                 // code += 'G1 Z'+(zh-pts[0].z)+' F30 \r\n \r\n';
//                 for(let i=0; i<pts.length; i++){ 
//                     v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
//                     let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
//                     m1.makeRotationY(shift_angle_b); 
//                     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
//                     angle_b += shift_angle_b;
//                     if(i < pts.length-1){
//                         m1.makeRotationY(angle_b);
//                         pts[i+1].applyMatrix4(m1);
//                         nml[i+1].applyMatrix4(m1);
//                     }
//                     code += 'G1 X'+d.rnd(xh+pts[i].x, 1000) + ' Y'+d.rnd(yh-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(zh-pts[i].z, 1000);
//                     code += ' A'+d.rnd(angle_a, 1000); 
//                     code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
//                     code += ' F'+d.rnd(feed/dis[i]*60, 1000); 
//                     code += '\r\n';
//                 }




///////////////////////////////////// 5 axis ribbon style //////////////////////////
// function axis_angles(v){
//     v5.set(0, v.y, v.z); // can't calculate angle_a until normal has been rotated on B!!! #1
//     let angle_a = down.angleTo(v5) * Math.sign(v.z);
//     v5.set(v.x, 0, v.z);
//     let angle_b = back.angleTo(v5) * Math.sign(v.x);
//     return {a:angle_a, b:angle_b};
// }

// var n_ref = nml[0].clone();
// var pts_ribbon = [[],[],[]];
// var angle_b = 0;
// for(let i=0; i<pts.length; i++){ 
//     //v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
//     //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
//     let shift_angle_b = axis_angles(nml[i]).b;
//     m1.makeRotationY(shift_angle_b); 
//     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
//     pts_ribbon[0].push(pts[i]);
//     pts_ribbon[1].push(pts[i].clone().add(v1.copy(n_ref).divideScalar(2)));
//     pts_ribbon[2].push(pts[i].clone().add(n_ref));
//     angle_b += shift_angle_b;
//     if(i < pts.length-1){
//         n_ref.copy(nml[i+1]);
//         m1.makeRotationY(angle_b);
//         pts[i+1].applyMatrix4(m1);
//         nml[i+1].applyMatrix4(m1);
//     }
// }

// var ribbon = d.geo.surface(d, pts_ribbon, {length_v:curve.getLength()});

// function move(gc, p, a={}){
//     pos.copy(p);
//     code += gc+' X'+d.rnd(xh+p.x, 1000)+' Y'+d.rnd(yh+offset_y+p.y, 1000)+' Z'+d.rnd(zh-p.z, 1000);
//     if(a.angles){
//         axis_b = a.angles.b;
//         code += ' A'+d.rnd(a_py+MathUtils.radToDeg(a.angles.a), 1000);
//         code += ' B'+d.rnd(    MathUtils.radToDeg(-a.angles.b), 1000);
//     }
//     if(gc == 'G1') code += ' F'+d.rnd(a.speed, 1000);
//     code += ' \r\n';
// }

// var res = ribbon.length_v / ribbon_div; 
// for(let v=1; v<res; v++){ 
//     ribbon.get_point(0, v/res, v1); 
//     ribbon.get_point(1, v/res, v2); v2.sub(v1); 
//     var angles = axis_angles(v2);
//     var delta_b = angles.b-axis_b;
//     v3.copy(v1).sub(pos);
//     v3.setX(v3.x + (delta_b*((pos.z+v1.z)/2)));//(Math.sin(angles.b-axis_b)*((pos.z+v1.z)/2))); // math.abs(z)? #1
//     move('G1', v1, {
//         angles: angles, 
//         speed: (path.speed / v3.length()) * 60,
//     });
// }
/////////////////////////////// 5 axis ribbon style /////////////////////////////////////










// var paths = [];
// function get_paths(nn){
//     const path_nodes = [];
//     d.node.for_n(d, nn, (r,nnn)=>{
//         if(d.n[nnn].c.paths != undefined){
//             paths = paths.concat(d.n[nnn].c.paths);
//             path_nodes.push(nnn);
//         }
//     });
//     path_nodes.forEach(nnn=> get_paths(nnn));
// }
// get_paths(n);
// var curve = new CurvePath();
// curve.arcLengthDivisions = 2000;
// var pts = [];
// var nml = [];
// var n_ref = [];
// var dis = [0];
// //var 
// var total_length = 0;
// paths.forEach(path=>{
//     var length = path.curve.getLength();
//     total_length += length;
//     var res = length / ribbon_div; // path.surface.length_v / span;
//     for(let v=0; v<res; v++){
//         pts.push(new Vector3());
//         nml.push(new Vector3());
//         path.ribbon.get_point(0, v/res, pts.at(-1));
//         path.ribbon.get_point(1, v/res, nml.at(-1));
//         nml.at(-1).sub(pts.at(-1));
//         n_ref.push(nml.at(-1).clone());
//         if(pts.length > 1){
//             curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
//             dis.push(pts.at(-2).distanceTo(pts.at(-1)));
//         }
//     }
// });

// const pt_span = curve.getLength() / pts.length;
// const range = Math.round(normal_smooth_span / pt_span / 2) + 1; // +1 here ?!?!?!?!?!
// for(let i=0; i<nml.length; i++){ 
//     var vc = 1;
//     var rng = range;
//     if(rng > i) rng = i;
//     if(rng > nml.length-1-i) rng = nml.length-1-i;
//     for(let k=-rng; k<=rng; k++){ 
//         if(k != 0 && n_ref[i+k]){
//             nml[i].add(n_ref[i+k]);
//             vc++;
//         }
//     }
//     nml[i].divideScalar(vc);      
// }

// var n_ref = nml[0].clone();
// var pts_ribbon = [[],[],[]];
// var angle_b = 0;
// for(let i=0; i<pts.length; i++){ 
//     v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
//     let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
//     m1.makeRotationY(shift_angle_b); 
//     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
//     pts_ribbon[0].push(pts[i]);
//     pts_ribbon[1].push(pts[i].clone().add(v1.copy(n_ref).divideScalar(2)));
//     pts_ribbon[2].push(pts[i].clone().add(n_ref));
//     angle_b += shift_angle_b;
//     if(i < pts.length-1){
//         n_ref.copy(nml[i+1]);
//         m1.makeRotationY(angle_b);
//         pts[i+1].applyMatrix4(m1);
//         nml[i+1].applyMatrix4(m1);
//     }
// }

// const ribbon = d.geo.surface(d, pts_ribbon, {length_v:total_length});





            // var angle_a = -58; 
            // //v1.set(nml[0].x, 0, nml[0].z);
            // //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
            // var angle_b = 0; // need to set to start of path 
            // var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
            // code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
            // code += 'G0 X'+xh+' Y-300 A'+angle_a+' \r\n';
            // code += 'G0 Z'+(zh-pts[0].z-z_start)+' \r\n';
            // code += 'G0 Y'+yh+' \r\n';
            // code += 'G1 Z'+(zh-pts[0].z)+' F30 \r\n \r\n';
            // for(let i=0; i<pts.length; i++){ 
            //     v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
            //     let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
            //     m1.makeRotationY(shift_angle_b); 
            //     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
            //     angle_b += shift_angle_b;
            //     if(i < pts.length-1){
            //         m1.makeRotationY(angle_b);
            //         pts[i+1].applyMatrix4(m1);
            //         nml[i+1].applyMatrix4(m1);
            //     }
            //     code += 'G1 X'+d.rnd(xh+pts[i].x, 1000) + ' Y'+d.rnd(yh-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(zh-pts[i].z, 1000);
            //     code += ' A'+d.rnd(angle_a, 1000); 
            //     code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
            //     code += ' F'+d.rnd(feed/dis[i]*60, 1000); 
            //     code += '\r\n';
            // }

















            // for(let i=0; i<nml.length; i++){ 
            //     var vc = 1;
            //     for(let k=-nml_smooth_range; k<=nml_smooth_range; k++){ 
            //         if(k != 0 && n_ref[i+k]){
            //             nml[i].add(n_ref[i+k]);
            //             vc++;
            //         }
            //     }
            //     nml[i].divideScalar(vc);      
            // }


//for(let i=nml_smooth_range; i<nml.length-nml_smooth_range; i++){ // not smoothing front and end !!!!!!
//nml[i].divideScalar(nml_smooth_range*2 + 1);

// path.forEach(np=>{
//     pts.push(pn.p.clone());
//     nml.push(pn.n.clone());
//     n_ref.push(pn.n.clone());
//     if(pts.length > 1){
//         curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
//         dis.push(pts.at(-2).distanceTo(pts.at(-1)));
//     }
// });

//if(dis[i] == 0) continue;


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
                    //     let step_angle_b = shift_angle_b*(k/step);
                    //     m1.makeRotationY(step_angle_b); 
                    //     v2.copy(v1).applyMatrix4(m1);
                    //     //rpts.push(v2.clone());
                    //     gpts.push(v2.clone());
                    //     code += 'G1 X'+d.rnd(v2.x) + ' Y'+d.rnd(v2.y)+ ' Z'+d.rnd(v2.z);
                    //     code += ' A'+0+ ' B'+d.rnd(MathUtils.radToDeg(base_angle_b + step_angle_b));
                    //     code += ' F1000'; // mm per minute
                    //     code += '\r\n';
                    // }