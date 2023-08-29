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
const axis_t = new Vector3();
const ortho1 = new Vector3();
const ortho2 = new Vector3();

//const loop_span = 5; 
//const origin_surface_res = 800;
const surface_div = 1000;
const end_surface_div = 900;
const end_box_size = 2;
const max_shift = .1;
const min_span = .5; 
const max_span = 8;
const min_size = 10;
const clip_u = 2;
//const start_clip = 50;
//const end_clip = 20;
//const pivot_smooth = 8;


export const coil = {
    props: 'axis_x axis_y axis_z density speed flow nozzle_diameter layer_count axis_count axis_angle',
    view(){ // will run regardless of manual_compute tag 
        // set which layer to show
    },
    node(d, n, c, ax, a={}){
        try{
            //const c = d.n[n].c;//d.reckon.props(d, n, 'axis_x axis_y axis_z density nozzle_diameter');
            //const ax = d.n[n].ax;

            delete c.paths;
            delete ax.curve;
            delete ax.pts;
            
            const loop_span = c.nozzle_diameter / c.density; 

            var surfaces = d.n[n].n.surface.map(surface=> d.n[surface].c.surface);
            const end_surf = {};
            //var axis_count = 1;
            if(c.fill){
                var sn = d.n[n].n.surface; // surface nodes
                var aon = sn.reduce((sum, sn)=> sum + d.n[sn].c.order, 0) / sn.length; // average order number (for surfaces)
                surfaces = [];
                var end_surfaces = [];
                console.log(aon);
                sn.forEach(sn=> {
                    if(d.n[sn].c.order < aon) surfaces.push(d.n[sn].c.surface)
                    else end_surfaces.push(d.n[sn].c.surface);
                });
                //axis_count = 3;
                console.log('Compute Coil - end_surf');
                end_surfaces.forEach(surface => {
                    for(let u=0; u<end_surface_div; u++){ // make this res relative to size of surface #1
                        for(let v=0; v<end_surface_div; v++){ 
                            surface.get_point_normal(u/end_surface_div, v/end_surface_div, v1, v2);
                            var k = 'x'+Math.round(v1.x/end_box_size) 
                                  + 'y'+Math.round(v1.y/end_box_size) 
                                  + 'z'+Math.round(v1.z/end_box_size) 
                            if(!end_surf[k]) end_surf[k] = {b:new Box3(), nml:[], p:new Plane()};
                            end_surf[k].b.expandByPoint(v1);
                            end_surf[k].nml.push(v2.clone());
                        }
                    }
                });
                Object.values(end_surf).forEach(es=>{
                    v1.set(0,0,0);
                    es.nml.forEach(nml=> v1.add(nml));
                    v1.divideScalar(es.nml.length);
                    es.b.getCenter(v2);
                    es.p.setFromNormalAndCoplanarPoint(v1, v2);//*Math.sign(v1.dot(v2))); // do I need to clone v1? #1
                    //console.log(es.p);
                });
            }

            
            console.log('Compute Coil - raw_surf');
            const raw_surf = [];
            surfaces.forEach(surface => {
                for(let u=clip_u; u<surface_div-clip_u; u++){ // make this res relative to size of surface !!!!!!!
                    for(let v=0; v<surface_div; v++){ 
                        surface.get_point_normal(u/surface_div, v/surface_div, v1, v2);
                        raw_surf.push({p:v1.clone(), n:v2.clone()});
                    }
                }
            });
            

            axis.set(c.axis_x, c.axis_y, c.axis_z).normalize();
            axis_t.copy(axis);
            if(c.axis_count > 1){
                ortho1.randomDirection().cross(axis).normalize();
                axis_t.applyAxisAngle(ortho1, MathUtils.degToRad(c.axis_angle));
            }
            const axes = [];
            for(let i=0; i<c.axis_count; i++){
                ortho1.randomDirection().cross(axis_t).normalize();//ortho1.set(c.axis_z, c.axis_x, c.axis_y).normalize();
                ortho2.copy(ortho1).cross(axis_t).normalize();
                axes.push({axis:axis_t.clone(), ortho1:ortho1.clone(), ortho2:ortho2.clone()});
                axis_t.applyAxisAngle(axis, Math.PI*2 / c.axis_count);
            }

            var sorted_pivots = [];
            axes.forEach((axis, l)=>{
                console.log('Compute Coil - pivots');
                const pivots = {};
                raw_surf.forEach(rs=>{
                    v2.copy(rs.p).projectOnVector(axis.axis);
                    let k = Math.round(v2.length()*Math.sign(v2.dot(axis.axis))*4);
                    if(!pivots['k'+k]) pivots['k'+k] = {b:new Box3(), v: new Vector3()};
                    pivots['k'+k].b.expandByPoint(rs.p);
                });
                Object.values(pivots).forEach(pivot=> pivot.b.getCenter(pivot.v));
                var pvt = Object.entries(pivots).map(([k,v],i)=> ({k: parseInt(k.slice(1)), v:v.v}));
                pvt.sort((a,b)=> a.k-b.k);
                sorted_pivots = sorted_pivots.concat(pvt);

                //axis.pivots = pivots;
                console.log('Compute Coil - surf_data');
                var surf_data = [];
                raw_surf.forEach(rs=>{
                    v2.copy(rs.p).projectOnVector(axis.axis); // axis point
                    let axis_pos = v2.length()*Math.sign(v2.dot(axis.axis));
                    let pivot = pivots['k'+Math.round(axis_pos*4)].v;
                    v4.copy(rs.p).sub(pivot); // vector from pivot to surface point
                    var angle = v4.angleTo(axis.ortho1) * Math.sign(v4.dot(axis.ortho2)); 
                    if(angle < 0) angle += Math.PI*2;
                    var shift = -((axis_pos + (angle/(Math.PI*2))*loop_span) % loop_span); // remainder
                    if (Math.abs(shift) > loop_span/2){ // need Math.abs(shift) here ?!?!?!??!?!?!
                        shift = -(loop_span-Math.abs(shift))*Math.sign(shift);
                    }
                    if(Math.abs(shift) < max_shift){
                        v7.copy(axis.axis).multiplyScalar(shift); // shift along axis vector to align with coil
                        v8.copy(rs.p).add(v7); // new surface point
                        v5.copy(v8);//.add(v3.copy(rs.n).multiplyScalar(c.nozzle_diameter * l));
                        surf_data.push({p:v5.clone(), n:rs.n.clone(), o:axis_pos+shift, sp:v8.clone()}); // don't need to clone rs.n ?!?!?!?!?!
                    }
                });
                surf_data.sort((a,b)=> a.o-b.o);
                axis.surf_data = surf_data;
            });

            var ai = 0; // axis index
            const paths = []; 
            const curves = [];
            var surf_data = axes[ai].surf_data;
            for(let l=0; l<c.layer_count*c.axis_count; l++){ 
                var point_ref = surf_data[0].p;//paths[0][0].p;
                var pts = [[],[],[]]; // could just be 3 with second v as center line ?!?!?!?!?!
                var box = new Box3();
                var hit_inside = false;
                var hit_outside = false;
                var start_i = 0;
                for(let i=1; i<surf_data.length; i++){ 
                    let dist = point_ref.distanceTo(surf_data[i].p);   
                    if(c.fill){
                        var k = 'x'+Math.round(surf_data[i].p.x/end_box_size) 
                              + 'y'+Math.round(surf_data[i].p.y/end_box_size) 
                              + 'z'+Math.round(surf_data[i].p.z/end_box_size);
                        if(end_surf[k]){
                            if(end_surf[k].p.distanceToPoint(surf_data[i].p) < 0) hit_inside = true
                            else hit_outside = true;
                        }
                    }
                    if(dist > max_span || i == surf_data.length-1 || hit_outside){ // check for end_surface !!!!!!!
                        if(pts[0].length > 2 && box.getSize(v1).length() > min_size && !(!hit_inside && hit_outside)){
                            var make_path = true;
                            if(!hit_inside){
                                v1.copy(surf_data[start_i].sp).sub(surf_data[start_i].p);
                                v2.copy(v1).normalize();
                                for(let j=0; j < v1.length(); j += end_box_size/6){
                                    v3.copy(surf_data[start_i].p).add(v4.copy(v2).multiplyScalar(j));
                                    var k = 'x'+Math.round(v3.x/end_box_size) 
                                            + 'y'+Math.round(v3.y/end_box_size) 
                                            + 'z'+Math.round(v3.z/end_box_size);
                                    if(end_surf[k]){// && end_surf[k].p.distanceToPoint(surf_data[start_i].p) > 0){
                                        make_path = false;
                                        break;
                                    }
                                }
                            }
                            if(make_path){
                                if(hit_outside && dist <= max_span){
                                    point_ref = surf_data[i].p.clone();
                                    end_surf[k].p.projectPoint(surf_data[i].p, point_ref);
                                    pts[0].push(point_ref);
                                    pts[1].push(point_ref.clone().add(v1.copy(surf_data[i].n).divideScalar(2))); 
                                    pts[2].push(point_ref.clone().add(surf_data[i].n));
                                }
                                var curve = new CatmullRomCurve3(pts[0]);
                                curve.arcLengthDivisions = 2000;
                                var ribbon = d.geo.surface(d, pts, {length_v:curve.getLength()});
                                paths.push({ribbon:ribbon, speed:c.speed, flow:c.flow}); // curve:curve, 
                                curves.push(curve);
                            }
                        }
                        pts = [[],[],[]];
                        box = new Box3(); // .makeEmpty() #2
                        hit_inside = false;
                        
                        start_i = 0;
                    }
                    if(dist > min_span){ // check for end_surface !!!!!!!
                        if(pts[0].length < 1) start_i = i;
                        point_ref = surf_data[i].p.clone();
                        if(hit_outside) end_surf[k].p.projectPoint(surf_data[i].p, point_ref);
                        box.expandByPoint(point_ref);
                        pts[0].push(point_ref);
                        pts[1].push(point_ref.clone().add(v1.copy(surf_data[i].n).divideScalar(2))); 
                        pts[2].push(point_ref.clone().add(surf_data[i].n));
                    } 
                    hit_outside = false;
                }
                ai++;
                if(ai > axes.length-1){
                    ai = 0;
                    for(let ll=0; ll<axes.length; ll++){ 
                        var surf_data = axes[ll].surf_data;
                        for(let i=0; i<surf_data.length; i++){ 
                            surf_data[i].p.add(v1.copy(surf_data[i].n).multiplyScalar(c.nozzle_diameter));//(c.nozzle_diameter * axes.length));
                        }
                    }
                }
                surf_data = axes[ai].surf_data;
            }
            

            //c.surface = surface;
            //console.log(paths);
            c.paths = paths;  // rename to ribbons ?!?!?!?!?!?!
            ax.curve = curves; // make curve an array of auxiliary curves ?!?!?!?!?!
            ax.pts = sorted_pivots.map(p=> p.v);
            console.log('Reckoned Coil!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};


                    //curve.add(new LineCurve3(point_ref, surf_data[i].p)); // just add points for continuous curve
                    // paths[0].push({
                    //     p: surf_data[i].p,
                    //     n: surf_data[i].n,
                    // });

                    // const normal_point = surf_data[i].p.clone().add(surf_data[i].n);
                    // pts.push([
                    //     surf_data[i].p,
                    //     surf_data[i].p,
                    //     normal_point,
                    //     normal_point
                    // ]);



// let axis_pos = v2.length()*Math.sign(v2.dot(axis));
// //let remainder = axis_pos % 1;
// let k = Math.round(axis_pos*4);
// //if(k < first_pivot + start_clip || k > last_pivot - end_clip) continue;
// //let pivot = pivots['k'+k].v;  // get pivot1
// v3.copy(pivots['k'+k].v);

// // let vc = 1;
// // for(let ks=-pivot_smooth; ks<=pivot_smooth; ks++){ 
// //     if(ks != 0 && pivots['k'+k+ks]){
// //         v3.add(pivots['k'+k+ks].v);
// //         vc++;
// //     }
// // }
// // v3.divideScalar(vc);

// v4.copy(v1).sub(v3); // vector from pivot to surface point





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