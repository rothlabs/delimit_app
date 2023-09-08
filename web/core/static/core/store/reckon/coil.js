import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, Ray, CatmullRomCurve3, Box3, Raycaster, Mesh, MeshBasicMaterial, Line3, Plane, LineCurve3, CurvePath} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';
import gpuJs from 'gpu';

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

const point = new Vector3();
const normal = new Vector3();

const axis = new Vector3();
const axis_t = new Vector3();
const ortho1 = new Vector3();
const ortho2 = new Vector3();

//const slice_div = 5; 
const surface_div = 900;
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

//const raw_point_count = surface_div*surface_div;
//const max_slice_count = 100000;
const axis_ratio = 0.01;

const gpu = new gpuJs.GPU();

//     v2.copy(point).projectOnVector(axis.axis); // axis point
//     let axis_pos = v2.length()*Math.sign(v2.dot(axis.axis));



export const coil = { // 'density', 'speed', 'flow', 'cord_radius ', should be in own node? #1
    props: ['axis_x', 'axis_y', 'axis_z', 'density', 'speed', 'flow', 'cord_radius', 'layers', 'axes', 'spread_angle', 'material'],
    view(){ // will run regardless of manual_compute tag 
        // set which layer to show
    },
    node(d, n, c, ax, a={}){ // rename ax to ac? or s for secondary? or something random like j or q #1
        //console.log(kernel());

        try{
            //const c = d.n[n].c;//d.reckon.props(d, n, 'axis_x axis_y axis_z density cord_radius');
            //const ax = d.n[n].ax;

            delete c.paths;
            delete ax.curve;
            delete ax.pts;

            var surfaces = d.n[n].n.surface.map(surface=> d.n[surface].c.surface);
            const slice_div = c.cord_radius / c.density; 
            const half_slice_cnt = Math.round(d.easel_size/slice_div/2);
            const curves = [];
            const paths = []; 

            console.log('Slice: axes');
            const axes = [];
            const axes_x = [];
            const axes_y = [];
            const axes_z = [];
            axis.set(c.axis_x, c.axis_y, c.axis_z).normalize();
            axis_t.copy(axis);
            if(c.axes > 1){
                ortho1.randomDirection().cross(axis).normalize();
                axis_t.applyAxisAngle(ortho1, MathUtils.degToRad(c.spread_angle));
            }
            for(let i=0; i<c.axes; i++){
                ortho1.randomDirection().cross(axis_t).normalize();//ortho1.set(c.axis_z, c.axis_x, c.axis_y).normalize();
                ortho2.copy(ortho1).cross(axis_t).normalize();
                axes.push({axis:axis_t.clone(), ortho1:ortho1.clone(), ortho2:ortho2.clone()});
                axes_x.push(axis_t.x);
                axes_y.push(axis_t.y);
                axes_z.push(axis_t.z);
                axis_t.applyAxisAngle(axis, Math.PI*2 / c.axes);
            }
            // const axes_x = axes.map(axis=> axis.axis.x);
            // const axes_y = axes.map(axis=> axis.axis.y);
            // axes.map(axis=> axis.axis.z);

            console.log('Slice: bnd_vox');
            const bnd_vox = {};
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
                end_surfaces.forEach(surface => {
                    for(let u=0; u<end_surface_div; u++){ // make this res relative to size of surface #1
                        for(let v=0; v<end_surface_div; v++){ 
                            surface.get_point_normal(u/end_surface_div, v/end_surface_div, v1, v2);
                            var k = 'x'+Math.round(v1.x/end_box_size) 
                                  + 'y'+Math.round(v1.y/end_box_size) 
                                  + 'z'+Math.round(v1.z/end_box_size) 
                            if(!bnd_vox[k]) bnd_vox[k] = {b:new Box3(), nml:[], p:new Plane()};
                            bnd_vox[k].b.expandByPoint(v1);
                            bnd_vox[k].nml.push(v2.clone());
                        }
                    }
                });
                Object.values(bnd_vox).forEach(es=>{
                    v1.set(0,0,0);
                    es.nml.forEach(nml=> v1.add(nml));
                    v1.divideScalar(es.nml.length);
                    es.b.getCenter(v2);
                    es.p.setFromNormalAndCoplanarPoint(v1, v2);//*Math.sign(v1.dot(v2))); // do I need to clone v1? #1
                });
            }
            
            console.log('Slice: src_pts'); 
            var pts_arrays = [];
            var nml_arrays = [];
            surfaces.forEach(surface => {
                let geo = new ParametricGeometry(
                    surface.get_point, 
                    surface_div, 
                    surface_div,
                );
                pts_arrays.push(geo.attributes.position.array);
                nml_arrays.push(geo.attributes.normal.array);
            });
            const src_pts = d.join_float_32_arrays(pts_arrays);
            const src_nml = d.join_float_32_arrays(nml_arrays);

            const src_pnt_cnt = src_pts.length/3;
            const axis_pnt_cnt = Math.floor(src_pnt_cnt*axis_ratio);
            const chunk = Math.floor(src_pnt_cnt/axis_pnt_cnt);//*3;

            console.log('Slice: axis_pts');
            const compute_axis_pts = gpu.createKernel(function(src_pts, src_nml, layer_div, slice_div, half_slice_cnt, chunk, max_shift, ax, ay, az){ // axis_x, axis_y, axis_z, 
                var pi = this.thread.x;
                var ai = this.thread.y;
                var li = this.thread.z;
                var shift = 1000;
                var slice = -1;
                var src_idx = 0;
                var x = 0;
                var y = 0;
                var z = 0;
                for(let i = 0; i < chunk; i++){//for(let i = pi*this.constants.chunk; i < (pi+1)*this.constants.chunk; i++){
                    var ci = ((pi*chunk) + i) * 3;
                    var tx = src_pts[ci]   + (src_nml[ci]   * layer_div * (li+6));
                    var ty = src_pts[ci+1] + (src_nml[ci+1] * layer_div * (li+6));
                    var tz = src_pts[ci+2] + (src_nml[ci+2] * layer_div * (li+6));
                    var axis_pos = tx*ax[ai] + ty*ay[ai] + tz*az[ai];
                    var test_shift = -(axis_pos % slice_div); //-(points[i+1] % slice_div); 
                    var abs_shift = Math.abs(test_shift);
                    if (abs_shift > slice_div/2) test_shift = -(slice_div-abs_shift)*Math.sign(test_shift);
                    if(Math.abs(shift) > Math.abs(test_shift)){
                        shift = test_shift;
                        slice = axis_pos;//Math.round((axis_pos+shift)/slice_div) + half_slice_cnt;
                        src_idx = i;// / this.constants.chunk;
                        x = tx;
                        y = ty;
                        z = tz;
                    }
                }
                if(Math.abs(shift) > max_shift) return [-10, -100, -100, -100];
                slice = Math.round((slice+shift)/slice_div) + half_slice_cnt;
                src_idx /= chunk;//this.constants.chunk;
                x += ax[ai] * shift;
                y += ay[ai] * shift;
                z += az[ai] * shift;
                return [slice + src_idx, x, y, z];
            },{
                //pipeline: true,
                loopMaxIterations: chunk,
                //constants: {chunk: chunk},//{max_shift: max_shift},
                output: [axis_pnt_cnt, c.axes, c.layers], // component list gets switch around?
            }); 
            const axis_pts = compute_axis_pts(
                src_pts, src_nml, c.cord_radius*1.6, slice_div, half_slice_cnt, chunk, max_shift,
                axes_x, axes_y, axes_z,
            );
            console.log(axis_pts);

            console.log('Slice: links'); 
            const compute_links = gpu.createKernel(function(axis_pts, src_nml, axis_pnt_cnt, chunk, ax, ay, az){//shifted_pts, slice_idx){ // axis_x, axis_y, axis_z, 
                var pi = this.thread.x;
                var ai = this.thread.y;
                var li = this.thread.z;
                var dist = 100000;
                var link = -1;
                if(axis_pts[li][ai][pi][0] < 0) return -10;//[-10, -10];
                var slice = Math.floor(axis_pts[li][ai][pi][0]);
                var p0x = axis_pts[li][ai][pi][1];
                var p0y = axis_pts[li][ai][pi][2];
                var p0z = axis_pts[li][ai][pi][3];
                //var link2 = -1;
                if(p0x < -500) return -10;//[-10, -10];
                if(slice < 0) return -10;//[-10, -10];
                for(let i = 0; i < axis_pnt_cnt; i++){ //this.thread.x+1
                    if(pi != i){
                        //slice = Math.floor(axis_pts[li][ai][pi][0]);
                        //if(axis_pts[li][ai][i][0] < 0) continue;
                        if(slice == Math.floor(axis_pts[li][ai][i][0])){
                            var p1x = axis_pts[li][ai][i][1];
                            var p1y = axis_pts[li][ai][i][2];
                            var p1z = axis_pts[li][ai][i][3];
                            //if(p1x < -500) continue;
                            var delta_x = p1x - p0x;
                            var delta_y = p1y - p0y;
                            var delta_z = p1z - p0z;
                            var pnt_dist = Math.sqrt(Math.pow(delta_x,2) + Math.pow(delta_y,2) + Math.pow(delta_z,2));
                            if(dist > pnt_dist){
                                var k = ((pi*chunk + Math.round((axis_pts[li][ai][pi][0] % 1)*chunk))) * 3;
                                var cross_x = (ay[ai]*src_nml[k+2]) - (az[ai]*src_nml[k+1]);
                                var cross_y = (az[ai]*src_nml[k  ]) - (ax[ai]*src_nml[k+2]);
                                var cross_z = (ax[ai]*src_nml[k+1]) - (ay[ai]*src_nml[k  ]);
                                var crs_dist = Math.sqrt(Math.pow(cross_x,2) + Math.pow(cross_y,2) + Math.pow(cross_z,2));
                                var dot = ((delta_x/pnt_dist) * (cross_x/crs_dist)) 
                                        + ((delta_y/pnt_dist) * (cross_y/crs_dist)) 
                                        + ((delta_z/pnt_dist) * (cross_z/crs_dist));
                                if(dot > 0){
                                    dist = pnt_dist;
                                    //link2 = link
                                    link = i;
                                }
                            }
                        }
                    }
                }
                return link;//[slice, link];//[link, link2, 0];
            },{
                loopMaxIterations: axis_pnt_cnt,
                //constants: {axis_pnt_cnt: axis_pnt_cnt},
                output: [axis_pnt_cnt, c.axes, c.layers], // x y comes out siwtched around for some reason
            }); 
            const links = compute_links(axis_pts, src_nml, axis_pnt_cnt, chunk, axes_x, axes_y, axes_z);//shifted_pts, slice_idx);
            console.log(links);

            console.log('Slice: src_paths');
            const src_paths = [];
            const used = new Array(axis_pnt_cnt).fill(false);
            function push_src_path_pnt(li, ai, pi){ // could just save list of indices 
                //if(axis_pts[li][ai][i][1] < -500) return;
                //console.log(i);
                //console.log(axis_pts[li][ai]);
                if(links[li][ai][pi][1] < 0 || links[li][ai][pi][0] < 0){
                    console.log('links less than zero!');
                    console.log(links[li][ai][pi]);
                }
                v1.set(axis_pts[li][ai][pi][1], axis_pts[li][ai][pi][2], axis_pts[li][ai][pi][3]);
                //console.log(i);
                var k = ((pi*chunk + Math.round((axis_pts[li][ai][pi][0] % 1)*chunk))) * 3;
                //console.log(i);
                v2.set(src_pts[k], src_pts[k+1], src_pts[k+2]);
                v3.set(src_nml[k], src_nml[k+1], src_nml[k+2]);
                src_paths[li][ai].push({
                    p:       v1.clone(),
                    src_pnt: v2.clone(),
                    src_nml: v3.clone(), 
                });
            }
            for(var li = 0; li < c.layers; li++){
                src_paths.push([]);
                for(var ai = 0; ai < c.axes; ai++){ 
                    src_paths[li].push([]);
                    //links[li][ai].reverse();

                    
                    // var idx = 0;
                    // for(let i=0; i < axis_pnt_cnt; i++){  
                    //     push_src_path_pnt(idx);
                    //     idx = links[li][ai][idx];
                    // }
                    //links[li][ai].sort((a,b)=> a[0]-b[0]);
                    used.fill(false);
                    console.log(used);
                    //for(let s=0; s < half_slice_cnt; s++){  
                        for(let i=0; i < axis_pnt_cnt; i++){ 
                            var pi = i;  
                            if(links[li][ai][pi] < 0) continue; // redundant ?!
                            while(!(pi < 0 || used[pi])){
                                //if(axis_pts[li][ai][idx][1] < -400 && links[li][ai][idx]) console.log('oh my fing god');
                                //if(links[li][ai][idx][1] < 0 || used[links[li][ai][idx][1]]) break;
                                // }else{
                                //     if(links[li][ai][links[li][ai][idx]] < 0 || used[links[li][ai][links[li][ai][idx]]]) break;
                                // }
                                //if(links[li][ai][idx][0] != s) break;// || links[li][ai][idx][1] < 0) break;
                                //console.log(links[li][ai][idx][1]);
                                //if(axis_pts[li][ai][links[li][ai][idx][1]][1] < 0) console.log('less then zero!!!!!');
                                push_src_path_pnt(li, ai, pi);
                                used[pi] = true;
                                pi = links[li][ai][pi];
                                //if(idx < 0) break;
                            }
                        }
                    //}

                    // links[li][ai].sort((a,b)=> a[0]-b[0]);
                    // //used.fill(false);
                    // for(let i=0; i < axis_pnt_cnt; i++){   
                    //     var link = links[li][ai][i];
                    //     while(idx > -1 && !used[idx]){
                    //         push_src_path_pnt(idx);
                    //         used[idx] = true;
                    //         idx = links[li][ai][idx][2];
                    //     }
                    // }

                    //         var l0 = link_idx[i][k];
//         //if(l0[1]>-1 && l0[2]>-1 ) console.log(l0);
//         if(l0[1] > -1 && l0[2] > -1 && l0[3] == 0){  //!used_pts[link_idx[i][k][0]]){
//             while(l0 != null){
//                 push_raw_path_point(l0[0]);
//                 l0[3] = 1;//used_pts[l1[0]] = true;
//                 var l1 = link_idx[i][l0[1]];
//                 var l2 = link_idx[i][l0[2]];
//                 l0 = null;
//                 if(l1[1] > -1 && l1[2] > -1 && l1[3] == 0){//used_pts[l1[0]]){
//                     l0 = l1;
//                 }//else if(l2[1] > -1 && l2[2] > -1 && l2[3] == 0){//used_pts[l1[0]]){
//                 //    l0 = l2;
//                 //}
//             }
//         }

                    // for(let i=0; i < axis_pnt_cnt; i++){   
                    //     var l0 = links[li][ai][i];
                    //     if(l0[0] > -1 && l0[1] > -1 && l0[2] == 0){
                    //         while(l0 != null){
                    //             push_src_path_pnt(i);
                    //             l0[2] = 1;
                    //             var l1 = links[li][ai][l0[0]];
                    //             var l2 = links[li][ai][l0[1]];
                    //             l0 = null;
                    //             if(l1[0] > -1 && l1[1] > -1 && l1[2] == 0){//used_pts[l1[0]]){
                    //                 l0 = l1;
                    //             }else if(l2[0] > -1 && l2[1] > -1 && l2[2] == 0){//used_pts[l1[0]]){
                    //                 l0 = l2;
                    //             }
                    //         }
                    //     }
                    // }


                    var curve = new CatmullRomCurve3(src_paths[li][ai].map(p=> p.p));
                    curve.arcLengthDivisions = 2000;
                    curves.push(curve);
                }//);
            }
            console.log(src_paths);
            //compute_axes_surf_data({offset:0});



            // console.log('Slice: paths');
            // for(let li=0; li<c.layers; li++){ 
            //     for(let ai=0; ai<c.axes; ai++){ 
                    
            //         //for(let l=0; l<c.layers*c.axes; l++){ 
            //         // ai++; 
            //         // if(ai > axes.length-1){
            //         //     ai = 0;
            //         //     compute_axes_surf_data({offset:c.cord_radius*(l+1)}); ////////
            //         // }
            //         // var src_path = axes[ai].src_path;
            //         var src_path = src_paths[li][ai];
            //         var point_ref = src_path[0].p;//paths[0][0].p;
            //         var pts = [[],[],[]]; // could just be 3 with second v as center line ?!?!?!?!?!
            //         var box = new Box3();
            //         var hit_inside = false;
            //         var hit_outside = false;
            //         var start_i = 0;
            //         for(let i=1; i<src_path.length; i++){ 
            //             let dist = point_ref.distanceTo(src_path[i].p);   
            //             if(c.fill){
            //                 var k = 'x'+Math.round(src_path[i].p.x/end_box_size) 
            //                     + 'y'+Math.round(src_path[i].p.y/end_box_size) 
            //                     + 'z'+Math.round(src_path[i].p.z/end_box_size);
            //                 if(bnd_vox[k]){
            //                     if(bnd_vox[k].p.distanceToPoint(src_path[i].p) < 0) hit_inside = true
            //                     else hit_outside = true;
            //                 }
            //             }
            //             if(dist > max_span || i == src_path.length-1 || hit_outside){ // check for end_surface !!!!!!!
            //                 if(pts[0].length > 2 && box.getSize(v1).length() > min_size && !(!hit_inside && hit_outside)){
            //                     var make_path = true;
            //                     if(!hit_inside){
            //                         v1.copy(src_path[start_i].src_pnt).sub(src_path[start_i].p);
            //                         v2.copy(v1).normalize();
            //                         for(let j=0; j < v1.length(); j += end_box_size/6){
            //                             v3.copy(src_path[start_i].p).add(v4.copy(v2).multiplyScalar(j));
            //                             var k = 'x'+Math.round(v3.x/end_box_size) 
            //                                     + 'y'+Math.round(v3.y/end_box_size) 
            //                                     + 'z'+Math.round(v3.z/end_box_size);
            //                             if(bnd_vox[k]){// && bnd_vox[k].p.distanceToPoint(src_path[start_i].p) > 0){
            //                                 make_path = false;
            //                                 break;
            //                             }
            //                         }
            //                     }
            //                     if(make_path){
            //                         if(hit_outside && dist <= max_span){
            //                             point_ref = src_path[i].p.clone();
            //                             bnd_vox[k].p.projectPoint(src_path[i].p, point_ref);
            //                             pts[0].push(point_ref);
            //                             pts[1].push(point_ref.clone().add(v1.copy(src_path[i].src_nml).divideScalar(2))); 
            //                             pts[2].push(point_ref.clone().add(src_path[i].src_nml));
            //                         }
            //                         var curve = new CatmullRomCurve3(pts[0]);
            //                         curve.arcLengthDivisions = 2000;
            //                         var ribbon = d.geo.surface(d, pts, {length_v:curve.getLength()});
            //                         paths.push({
            //                             ribbon:   ribbon, 
            //                             speed:    c.speed, 
            //                             flow:     c.flow,
            //                             material: c.material,
            //                             cord_radius: c.cord_radius,
            //                         }); // curve:curve, 
            //                         curves.push(curve);
            //                     }
            //                 }
            //                 pts = [[],[],[]];
            //                 box = new Box3(); // .makeEmpty() #2
            //                 hit_inside = false;
                            
            //                 start_i = 0;
            //             }
            //             if(dist > min_span){ // check for end_surface !!!!!!!
            //                 if(pts[0].length < 1) start_i = i;
            //                 point_ref = src_path[i].p.clone();
            //                 if(hit_outside) bnd_vox[k].p.projectPoint(src_path[i].p, point_ref);
            //                 box.expandByPoint(point_ref);
            //                 pts[0].push(point_ref);
            //                 pts[1].push(point_ref.clone().add(v1.copy(src_path[i].src_nml).divideScalar(2))); 
            //                 pts[2].push(point_ref.clone().add(src_path[i].src_nml));
            //             } 
            //             hit_outside = false;
            //         }
            //     }
            // }
            

            //c.surface = surface;
            //console.log(paths);
            console.log('Curves: '+curves.length);
            c.paths = paths;  // rename to ribbons ?!?!?!?!?!?!
            ax.curve = curves; // make curve an array of auxiliary curves ?!?!?!?!?!
            //ax.pts = sorted_pivots.map(p=> p.v);
            console.log('Reckoned Coil!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};


            //const offset_pts = new Float32Array(src_pts.length);
            //const shifted_pts = new Float32Array(src_pts.length);
            //const used_pts = new Float32Array(src_pts.length/3);
            //function compute_axes_surf_data(a={}){
                //used_pts.fill(false);
                // offset_pts.set(src_pts);
                // for(let i=0; i < src_pts.length-3; i+=3){
                //     offset_pts[i]   += src_nml[i]   * a.offset;
                //     offset_pts[i+1] += src_nml[i+1] * a.offset;
                //     offset_pts[i+2] += src_nml[i+2] * a.offset;
                // }
                //var sorted_pivots = [];


// function push_raw_path_point(i){ // could just save list of indices 
//     i *= 3;
//     v1.set(src_pts[i],src_pts[i+1],src_pts[i+2]);
//     v2.set(src_nml[i],src_nml[i+1],src_nml[i+2]);
//     v3.set(shifted_pts[i],shifted_pts[i+1],shifted_pts[i+2]);
//     src_path.at(-1).at(-1).push({
//         raw_point: v1.clone(),
//         n: v2.clone(), 
//         p: v3.clone(), 
//     });
// }
// for(let i=0; i < half_slice_count*2; i++){
//     for(let k=0; k < point_count; k++){
//         var l0 = link_idx[i][k];
//         //if(l0[1]>-1 && l0[2]>-1 ) console.log(l0);
//         if(l0[1] > -1 && l0[2] > -1 && l0[3] == 0){  //!used_pts[link_idx[i][k][0]]){
//             while(l0 != null){
//                 push_raw_path_point(l0[0]);
//                 l0[3] = 1;//used_pts[l1[0]] = true;
//                 var l1 = link_idx[i][l0[1]];
//                 var l2 = link_idx[i][l0[2]];
//                 l0 = null;
//                 if(l1[1] > -1 && l1[2] > -1 && l1[3] == 0){//used_pts[l1[0]]){
//                     l0 = l1;
//                 }//else if(l2[1] > -1 && l2[2] > -1 && l2[3] == 0){//used_pts[l1[0]]){
//                 //    l0 = l2;
//                 //}
//             }
//         }
//     }
// }


// const get_link_idx = gpu.createKernel(function(slice_pts){//shifted_pts, slice_idx){ // axis_x, axis_y, axis_z, 
//     var shortest = 1000;
//     var p0 = slice_idx[this.thread.y][this.thread.x];
//     var p1 = -1;
//     var p2 = 1;//-1;
//     for(let i = 0; i < this.constants.point_count; i++){ //this.thread.x+1
//         if(i != this.thread.x){
//             var tp = slice_idx[this.thread.y][i];
//             var d = Math.sqrt(Math.pow(shifted_pts[p0*3]-shifted_pts[tp*3],2)+Math.pow(shifted_pts[p0*3+1]-shifted_pts[tp*3+1],2)+Math.pow(shifted_pts[p0*3+2]-shifted_pts[tp*3+2],2))
//             if(shortest > d){
//                 shortest = d;
//                 p2 = p1;
//                 p1 = i;//this.thread.x;//tp;
//             }
//         }
//     }
//     return [layer, slice, ];//p0, p1, p2, 0];
// },{
//     loopMaxIterations: point_count,
//     constants: {point_count: point_count},
//     output: [point_count, half_slice_count*2], // x y comes out siwtched around for some reason
// }); 


// const get_shift_idx = gpu.createKernel(function(points, slice_div, half_slice_count, ax, ay, az){ // axis_x, axis_y, axis_z, 
//     var i = this.thread.x*3;
//     var axis_pos = points[i]*ax + points[i+1]*ay + points[i+2]*az;
//     var shift = -(axis_pos % slice_div); //-(points[i+1] % slice_div); 
//     var abs_shift = Math.abs(shift);
//     if (abs_shift > slice_div/2){ 
//         shift = -(slice_div-abs_shift)*Math.sign(shift);
//     }
//     if(Math.abs(shift) < this.constants.max_shift){
//         //var slice = Math.round((points[i+1]+shift)/slice_div) + half_slice_count;
//         var slice = Math.round((axis_pos+shift)/slice_div) + half_slice_count;
//         return [slice, shift];
//     }else{
//         return [-10, 0]; //[0, this.constants.max_shift+1]; 
//     }
// },{
//     //pipeline: true,
//     constants: {max_shift: max_shift},
//     output: [raw_point_count], // this may be more if multiple surfaces! #1
// }); 



                        // for(let ll=0; ll<axes.length; ll++){ 
                        //     var surf_data = axes[ll].surf_data;
                        //     for(let i=0; i<surf_data.length; i++){ 
                        //         surf_data[i].p.add(v1.copy(surf_data[i].n).multiplyScalar(c.cord_radius));//(c.cord_radius * axes.length));
                        //     }
                        // }
                        // for(let i=0; i < src_pts.length-3; i+=3){
                        //     src_pts[i]   += src_nml[i]   * c.cord_radius;
                        //     src_pts[i+1] += src_nml[i+1] * c.cord_radius;
                        //     src_pts[i+2] += src_nml[i+2] * c.cord_radius;
                        //     // point.set(src_pts[i],src_pts[i+1],src_pts[i+2]);
                        //     // normal.set(src_nml[i],src_nml[i+1],src_nml[i+2]);
                        //     // point.add(normal.multiplyScalar(c.cord_radius));
                        // }





// console.log('Compute Coil - pivots');
// const pivots = {};
// //raw_surf.forEach(rs=>{
// for(let i=0; i < src_pts.length-3; i+=3){
//     //v2.copy(rs.p).projectOnVector(axis.axis);
//     point.set(src_pts[i],src_pts[i+1],src_pts[i+2]);
//     v2.copy(point).projectOnVector(axis.axis);
//     let k = Math.round(v2.length()*Math.sign(v2.dot(axis.axis))*4);
//     if(!pivots['k'+k]) pivots['k'+k] = {b:new Box3(), v: new Vector3()};
//     pivots['k'+k].b.expandByPoint(point);
// }
// //});
// Object.values(pivots).forEach(pivot=> pivot.b.getCenter(pivot.v));
// var pvt = Object.entries(pivots).map(([k,v],i)=> ({k: parseInt(k.slice(1)), v:v.v}));
// pvt.sort((a,b)=> a.k-b.k);
// //sorted_pivots = sorted_pivots.concat(pvt);

// //axis.pivots = pivots;
// console.log('Compute Coil - surf_data');
// var surf_data = [];
// //raw_surf.forEach(rs=>{
// for(let i=0; i < src_pts.length-3; i+=3){
//     point.set(src_pts[i],src_pts[i+1],src_pts[i+2]);
//     normal.set(src_nml[i],src_nml[i+1],src_nml[i+2]);
//     v2.copy(point).projectOnVector(axis.axis); // axis point
//     let axis_pos = v2.length()*Math.sign(v2.dot(axis.axis));
//     let pivot = pivots['k'+Math.round(axis_pos*4)].v;
//     v4.copy(point).sub(pivot); // vector from pivot to surface point
//     var angle = v4.angleTo(axis.ortho1) * Math.sign(v4.dot(axis.ortho2)); 
//     if(angle < 0) angle += Math.PI*2;
//     var shift = -((axis_pos + (angle/(Math.PI*2))*slice_div) % slice_div); // remainder
//     if (Math.abs(shift) > slice_div/2){ // need Math.abs(shift) here ?!?!?!??!?!?!
//         shift = -(slice_div-Math.abs(shift))*Math.sign(shift);
//     }
//     if(Math.abs(shift) < max_shift){
//         v7.copy(axis.axis).multiplyScalar(shift); // shift along axis vector to align with coil
//         v8.copy(point).add(v7); // new surface point
//         v5.copy(v8);//.add(v3.copy(rs.n).multiplyScalar(c.cord_radius * l));
//         surf_data.push({p:v5.clone(), n:normal.clone(), o:axis_pos+shift, sp:v8.clone()}); // don't need to clone rs.n ?!?!?!?!?!
//     }
// }
// //});
// surf_data.sort((a,b)=> a.o-b.o);
// axis.surf_data = surf_data;





// const get_slice_idx = gpu.createKernel(function(shift_idx){ // axis_x, axis_y, axis_z, 
//     var count = 0;
//     for(let i = this.thread.x; i < this.constants.point_count; i++){
//         if(shift_idx[i][1] < this.constants.max_shift){
//             count++;
//         }
//         if(count > this.thread.x){
//             return [i, shift_idx[i][0], shift_idx[i][1]];
//         }
//     }
//     return [-1, 0, 0];
// },{
//     loopMaxIterations: point_count,
//     constants: {max_shift:max_shift, point_count: point_count},
//     output: [slice_idx_count],
// }); 




            //     for(let u=clip_u; u<surface_div-clip_u; u++){ // make this res relative to size of surface !!!!!!!
            //         for(let v=0; v<surface_div; v++){ 
            //             surface.get_point_normal(u/surface_div, v/surface_div, v1, v2);
            //             raw_surf.push({p:v1.clone(), n:v2.clone()});
            //         }
            //     }


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