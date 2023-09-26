import {current} from 'immer';
import {Vector3, Vector2, Matrix4, MathUtils, Color, CatmullRomCurve3, Box3, 
        Mesh, MeshBasicMaterial, Line3, Plane, LineCurve3, CurvePath, BufferGeometry, PlaneGeometry} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';
//import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler';
import gpuJs from 'gpu';

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, SAH, CENTER, AVERAGE } from 'three-mesh-bvh';
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

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
const m2 = new Matrix4();
const m3 = new Matrix4();

const point = new Vector3();
const normal = new Vector3();
const dir = new Vector3();
const origin = new Vector3(0,0,0);
const up = new Vector3(0,1,0);
const forward = new Vector3(0,0,1);

const axis = new Vector3();
const axis_t = new Vector3();
const ortho1 = new Vector3();
const ortho2 = new Vector3();

const edge = new Line3();

//const slice_div = 5; 
const surface_div = 200;
const pts_per_mesh    = 1000000;
const edge_pts_per_mesh = 100000;
const end_surface_div = 900;
const bnd_vox_size = 2;
const max_shift = .1;
const min_div = .5; 
const max_div = 4; // 8
const min_length = 4;
//const start_clip = 50;
//const end_clip = 20;
//const pivot_smooth = 8;

//const raw_point_count = surface_div*surface_div;
//const max_slice_count = 100000;
const axis_ratio = 0.032; //1000000 * 0.032 = 32000 texture size. need to divide axis slice images into parts for big objects 

const gpu = new gpuJs.GPU();

const material = new MeshBasicMaterial(); // const plane_mesh = new Mesh(plane_geo, material);
const color = new Color();
const vector2 = new Vector2();
//     v2.copy(point).projectOnVector(axis.axis); // axis point
//     let axis_pos = v2.length()*Math.sign(v2.dot(axis.axis));

// gpu.addFunction(function dot(ax, ay, az, bx, by, bz) {
//     return ax*bx + ay*by + az*bz;
// });
gpu.addFunction(function crs_vct(x1, y1, z1, x2, y2, z2) {
    var x = y1*z2 - z1*y2;
    var y = z1*x2 - x1*z2;
    var z = x1*y2 - y1*x2;
    var d = Math.sqrt(x*x + y*y + z*z);
    return [x/d, y/d, z/d];
},{argumentTypes: {x1:'Number', y1:'Number', z1:'Number', x2:'Number', y2:'Number', z2:'Number'}, returnType:'Array(3)'});

gpu.addFunction(function dot_vct(x1, y1, z1, x2, y2, z2) {
    var d1 = Math.sqrt(x1*x1 + y1*y1 + z1*z1);
    return ((x1/d1)*x2) + ((y1/d1)*y2) + ((z1/d1)*z2);
},{argumentTypes: {x1:'Number', y1:'Number', z1:'Number', x2:'Number', y2:'Number', z2:'Number'}, returnType:'Number'});


// should collect random points on sharp edges of meshes too to ensure quality feature definition! #1
// connect front and back of slice loop

export const slice = { // 'density', 'speed', 'flow', 'cord_radius ', should be in own node? #1
    // should define type as text, decimal, int, bool:
    props: ['axis_x', 'axis_y', 'axis_z', 'density', 'speed', 'flow', 'cord_radius', 'layers', 'axes', 'spread_angle', 'material'],
    view(d, n, v, a={}){ // will run regardless of manual_compute tag 
        // set which layer to show
    },
    // put try catch in caller of this:
    node(d, n, c, ax, a={}){ // rename ax to ac? or s for secondary? or something random like j or q #1
        //console.log(kernel());

        try{
            //const c = d.n[n].c;//d.reckon.props(d, n, 'axis_x axis_y axis_z density cord_radius');
            //const ax = d.n[n].ax;

            delete c.paths;
            delete ax.curve;
            delete ax.pts;

            var surfaces = d.n[n].n.surface.map(surface=> d.n[surface].c.surface);
            //const slice_cnt = d.easel_size;
            const slice_div = (c.cord_radius*2) / c.density; 
            //const half_slice_cnt = Math.round(d.easel_size/slice_div/2);
            const curves = [];
            var paths = []; 

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
                axes.push({v:axis_t.clone(), ortho1:ortho1.clone(), ortho2:ortho2.clone()});
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
                    //for(let u=0; u<end_surface_div; u++){ // make this res relative to size of surface #1
                    //    for(let v=0; v<end_surface_div; v++){ 
                            const mesh = new Mesh(
                                new ParametricGeometry(
                                    surface.get_point, 
                                    surface_div, 
                                    surface_div,
                                ), 
                                material,
                            );
                            //surface.get_point_normal(u/end_surface_div, v/end_surface_div, v1, v2);
                            const sampler = new MeshSurfaceSampler(mesh).build();
                            for(let i=0; i < pts_per_mesh; i++){
                                sampler.sample(v1, v2, color, vector2);
                                var k = 'x'+Math.round(v1.x/bnd_vox_size) 
                                    + 'y'+Math.round(v1.y/bnd_vox_size) 
                                    + 'z'+Math.round(v1.z/bnd_vox_size) 
                                if(!bnd_vox[k]) bnd_vox[k] = {box:new Box3(), nml:[], pln:new Plane()};
                                bnd_vox[k].box.expandByPoint(v1);
                                bnd_vox[k].nml.push(v2.clone());
                            }
                    //    }
                    //}
                });
                Object.values(bnd_vox).forEach(bv=>{
                    v1.set(0,0,0);
                    bv.nml.forEach(nml=> v1.add(nml));
                    v1.divideScalar(bv.nml.length);
                    bv.box.getCenter(v2);
                    bv.pln.setFromNormalAndCoplanarPoint(v1, v2);//*Math.sign(v1.dot(v2))); // do I need to clone v1? #1
                });
            }
            

            console.log('Slice: segs'); 
            var max_seg_cnt = 0;
            const plane = new PlaneGeometry(d.easel_size, d.easel_size); 
            plane.computeBoundsTree({maxLeafTris: 1, strategy: CENTER});
            const conforms = [];
            const segs = [];
            surfaces.forEach(surface => {
                const conform = new ParametricGeometry(surface.get_point, surface_div, surface_div);
                conforms.push(conform);
            });
            for(let ai = 0; ai < c.axes; ai++){//axes.forEach((axis, ai)=>{
                segs.push([]);
                console.log('Slice: ai', ai);
                v1.copy(forward).cross(axes[ai].v).normalize();
                m1.makeRotationAxis(v1, forward.angleTo(axes[ai].v));
                conforms.forEach(conform=>{
                    if(ai > 0) conform.applyMatrix4(m2);
                    conform.applyMatrix4(m1);
                    conform.computeBoundsTree({maxDepth: 100, maxLeafTris: 1, strategy: CENTER});
                });
                m2.copy(m1).invert();
                
                for(let sp = -d.easel_size/2; sp < d.easel_size/2; sp += slice_div){
                    segs[ai].push([]);
                    m3.makeTranslation(0, 0, sp + slice_div/2)
                    var seg_cnt = 0;
                    conforms.forEach(conform=>{
                        conform.boundsTree.bvhcast(plane.boundsTree, m3, {
                            intersectsTriangles(triangle1, triangle2, i1, i2){
                                if(triangle1.intersectsTriangle(triangle2, edge)){
                                    triangle1.getNormal(normal);
                                    edge.applyMatrix4(m2);
                                    normal.applyMatrix4(m2);
                                    dir.copy(edge.end).sub(edge.start).normalize();
                                    v1.copy(dir).cross(normal).normalize();
                                    if(v1.dot(axes[ai].v) > 0){
                                        segs[ai].at(-1).push(
                                            edge.start.x,
                                            edge.start.y,
                                            edge.start.z,
                                            edge.end.x,
                                            edge.end.y,
                                            edge.end.z,
                                        );
                                    }else{
                                        segs[ai].at(-1).push(
                                            edge.end.x,
                                            edge.end.y,
                                            edge.end.z,
                                            edge.start.x,
                                            edge.start.y,
                                            edge.start.z,
                                        );
                                    }
                                    segs[ai].at(-1).push(
                                        normal.x,
                                        normal.y,
                                        normal.z,
                                    );
                                    seg_cnt++;
                                }
                            }
                        });
                    });
                    segs[ai].at(-1).unshift(seg_cnt);
                    if(max_seg_cnt < seg_cnt) max_seg_cnt = seg_cnt;
                    
                }
            }//);
            console.log('Slice: fill empty');
            const slice_cnt = segs[0].length;
            for(let ai = 0; ai < c.axes; ai++){
                for(let si = 0; si < slice_cnt; si++){
                    const empty = new Array((max_seg_cnt - segs[ai][si][0])*9 + 1).fill(0);
                    segs[ai][si] = [...segs[ai][si], ...empty];
                }
            }
            console.log('Slice: segs done');
            //console.log(segs);

            console.log('Slice: links'); 
            const compute_links = gpu.createKernel(function(segs){//, ax, ay, az){
                //var max_dist = 0.0001;//0.00000001; // 0.00005
                var sme  = -1; // start = 0, middle = 1, end = 2
                //var dir  = -1;
                var next = -1;
                var si = this.thread.y;
                var ai = this.thread.z;
                if(this.thread.x < segs[ai][si][0]){
                    var i1 = this.thread.x * 9;
                    var x1 = segs[ai][si][i1+1];
                    var y1 = segs[ai][si][i1+2];
                    var z1 = segs[ai][si][i1+3];
                    var x2 = segs[ai][si][i1+4];
                    var y2 = segs[ai][si][i1+5];
                    var z2 = segs[ai][si][i1+6];
                    //var dx = x1 - x2;
                    //var dy = y1 - y2;
                    //var dz = z1 - z2;
                    //if(Math.sqrt(dx*dx + dy*dy + dz*dz) > max_dist*2){
                        // var nx = segs[ai][si][i1+7];
                        // var ny = segs[ai][si][i1+8];
                        // var nz = segs[ai][si][i1+9];
                        // var dx = x2 - x1;
                        // var dy = y2 - y1;
                        // var dz = z2 - z1;
                        // var crs = crs_vct(dx, dy, dz, nx, ny, nz);
                        // if((ax[ai]*crs[0] + ay[ai]*crs[1] + az[ai]*crs[2]) > 0){//if(dot_vct(crs[0], crs[0], crs[0], ax[ai], ay[ai], az[ai]) > 0){//if((dx*crs1[0] + dy*crs1[1] + dz*crs1[2]) > 0){ // dot product
                        //     dir = 1;
                        // }
                        //var crs2 = crs_vct(crs1[0], crs1[1], crs1[2], nx, ny, nz);
                        var preceded  = false;
                        var succeeded = false;
                        //var proceded_dist = 10000;
                        //var succeeded_dist = 10000;
                        for(let i = 0; i < segs[ai][si][0]; i++){ 
                            var i2 = i * 9;
                            if(i1 != i2){
                                //var dx0 = segs[ai][si][i2+1] - segs[ai][si][i2+4];
                                //var dy0 = segs[ai][si][i2+2] - segs[ai][si][i2+5];
                                //var dz0 = segs[ai][si][i2+3] - segs[ai][si][i2+6];
                                //if(Math.sqrt(dx0*dx0 + dy0*dy0 + dz0*dz0) > max_dist*2){
                                    var dx1 = segs[ai][si][i2+4] - x1;
                                    var dy1 = segs[ai][si][i2+5] - y1;
                                    var dz1 = segs[ai][si][i2+6] - z1;
                                    var dx2 = segs[ai][si][i2+1] - x2;
                                    var dy2 = segs[ai][si][i2+2] - y2;
                                    var dz2 = segs[ai][si][i2+3] - z2;
                                    var d1 = Math.sqrt(dx1*dx1 + dy1*dy1 + dz1*dz1);
                                    if(d1 == 0){//proceded_dist > d1){
                                        //proceded_dist = d1;
                                        preceded = true;
                                    }
                                    var d2 = Math.sqrt(dx2*dx2 + dy2*dy2 + dz2*dz2);
                                    if(d2 == 0){//succeeded_dist > d2){
                                        //succeeded_dist = d2
                                        succeeded = true;
                                        next = i;
                                    }
                                //}
                            }
                        }
                        // if(proceded_dist <= max_dist) preceded = true;
                        // if(succeeded_dist <= max_dist){
                        //     succeeded = true;
                        // }else{
                        //     next = -1;
                        // }   
                        if(succeeded && !preceded){
                            sme = 0; // start seg
                        }else if(succeeded && preceded){
                            sme = 1; // middle seg
                        }else if(!succeeded && preceded){
                            sme = 2; // end seg
                        }
                    //}
                }
                return [sme, next];
            },{
                tactic: 'precision',
                loopMaxIterations: max_seg_cnt,
                output: {x:max_seg_cnt, y:slice_cnt, z:c.axes}, // order is switched around on output for some reason
            }); 
            const links = compute_links(segs);//, axes_x, axes_y, axes_z);//shifted_pts, slice_idx);
            //console.log(links);


            const src_paths = [[]];
            const seqs = []; 
            for(let ai = 0; ai < c.axes; ai++){
                seqs.push([]);
                for(let si = 0; si < slice_cnt; si++){
                    seqs[ai].push([]);
                    const starts = [];
                    const ends = [];
                    for(let i = 0; i < segs[ai][si][0]; i++){
                        if(links[ai][si][i][0] == 0) starts.push(i);
                        if(links[ai][si][i][0] == 2) ends.push(i);
                    }
                    //console.log('starts ends', starts.length, ends.length);
                    //if(starts.length != ends.length) continue;
                    var used = new Array(segs[ai][si][0]).fill(false);
                    function make_sequence(i){
                        seqs[ai][si].push([]);
                        function insert_sequence_item(k, o){
                            k *= 9;
                            seqs[ai][si].at(-1).push({
                                p: new Vector3(segs[ai][si][k+o+1], segs[ai][si][k+o+2], segs[ai][si][k+o+3]),
                                n: new Vector3(segs[ai][si][k+7],   segs[ai][si][k+8],   segs[ai][si][k+9]),
                            });
                        }
                        while(true){
                            insert_sequence_item(i, 0);
                            used[i] = true;
                            if(links[ai][si][i][1] < 0 || used[links[ai][si][i][1]]){
                                insert_sequence_item(i, 3);
                                return;
                            }
                            i = links[ai][si][i][1];   
                            if(links[ai][si][i][0] > 1){
                                insert_sequence_item(i, 0);
                                insert_sequence_item(i, 3);
                                used[i] = true;
                                return;
                            }
                        }
                    }
                    starts.forEach(start=> make_sequence(start));
                    while(true){ 
                        if(used.find((u,i)=>{
                            if(u) return false; 
                            //console.log('make_sequence');
                            make_sequence(i);
                            return true;
                        }) == undefined) break;
                    }
                    const reduced = [];
                    var j = -1;
                    const max_dist = 0.001;
                    var used = new Array(seqs[ai][si].length).fill(false);
                    for(let i = 0; i < seqs[ai][si].length; i++){
                        if(used[i] && seqs[ai][si][i].length) continue;
                        reduced.push(seqs[ai][si][i]);
                        j++;
                        for(let k = 0; k < seqs[ai][si].length; k++){
                            if(used[k] || i == k) continue;
                            if(reduced[j][0].p.distanceTo(seqs[ai][si][k][0].p) < max_dist){
                                reduced[j] = [...seqs[ai][si][k].reverse(), ...reduced[j]];
                                used[k] = true;
                                k = 0;
                            }else if(reduced[j][0].p.distanceTo(seqs[ai][si][k].at(-1).p) < max_dist){
                                reduced[j] = [...seqs[ai][si][k], ...reduced[j]];
                                used[k] = true;
                                k = 0;
                            }else if(reduced[j].at(-1).p.distanceTo(seqs[ai][si][k][0].p) < max_dist){
                                reduced[j] = [...reduced[j], ...seqs[ai][si][k]];
                                used[k] = true;
                                k = 0;
                            }else if(reduced[j].at(-1).p.distanceTo(seqs[ai][si][k].at(-1).p) < max_dist){
                                reduced[j] = [...reduced[j], ...seqs[ai][si][k].reverse()];
                                used[k] = true;
                                k = 0;
                            }
                        }
                    }
                    seqs[ai][si] = reduced;
                    src_paths[0] = [...src_paths[0], ...reduced];
                }
            }
            //console.log(seqs);
            //for(let ai = 0; ai < c.axes; ai++){
            //    for(let si = 0; si < slice_cnt; si++){

            


            console.log('Slice: paths');
            //var inside = true;
            //var ref_pnt = src_paths[0][0][0][0].p;
            var pva_start_idx = -1;
            for(let li=0; li<c.layers; li++){ 
                //for(let ai=0; ai<c.axes; ai++){ 
                    for(let pth=0; pth < src_paths[li].length; pth++){ 
                        var src_path = src_paths[li][pth];
                        var pts = [[],[],[]]; // could just be 3 with second v as center line ?!?!?!?!?!
                        //if(src_path.length < 3) continue;
                        for(let i=0; i < src_path.length; i++){  
                            //let dist = ref_pnt.distanceTo(src_path[i].p);
                            // function check_boundary(v){
                            //     var k = 'x'+Math.round(v.x / bnd_vox_size) 
                            //           + 'y'+Math.round(v.y / bnd_vox_size) 
                            //           + 'z'+Math.round(v.z / bnd_vox_size);
                            //     if(bnd_vox[k]){
                            //         if(bnd_vox[k].pln.distanceToPoint(src_path[i].p) < 0) inside = true
                            //         else inside = false;
                            //     }
                            // }
                            // for(let j = 0; j < dist; j += bnd_vox_size/10){
                            //     check_boundary(v1.lerpVectors(ref_pnt, src_path[i].p, j/dist));
                            //     //check_boundary(v1);
                            // }
                            // check_boundary(src_path[i].p);
                            //if(inside){// && dist > min_div){ // check for end_surface !!!!!!!
                                //ref_pnt = src_path[i].p.clone();
                                //if(hit_outside) bnd_vox[k].p.projectPoint(src_path[i].p, ref_pnt);
                                //box.expandByPoint(ref_pnt);
                                pts[0].push(src_path[i].p.clone());
                                pts[1].push(src_path[i].p.clone().add(v1.copy(src_path[i].n).divideScalar(2))); 
                                pts[2].push(src_path[i].p.clone().add(src_path[i].n));
                            //}
                            //if((!inside || i == src_path.length-1)){// && box.getSize(v1).length() > min_size){
                            if(i == src_path.length-1){
                                //console.log(pts[0].length);
                                if(pts[0].length > 1){
                                    var curve = new CatmullRomCurve3(pts[0]); // use nurbs curve?! #1
                                    curve.arcLengthDivisions = 3000; // make this dynamic #1
                                    //if(curve.getLength() > min_length){
                                        curves.push(curve);
                                        //console.log(curve);
                                        //if(pva_start_idx < 0 && c.material == 'PVA') pva_start_idx = paths.length;
                                        paths.push({
                                            ribbon:      d.geo.surface(d, pts, {length_v:curve.getLength()}), 
                                            speed:       c.speed, 
                                            flow:        c.flow,
                                            material:    c.material,
                                            cord_radius: c.cord_radius,
                                        }); 
                                    //}
                                }
                                if(pts[0].length > 0) pts = [[],[],[]];
                            }
                            //ref_pnt = src_path[i].p; // clone? #1
                        }
                    }
                //}
                // // if(pva_start_idx > -1){
                // //     //const air_paths = [];
                // //     let end_idx = paths.length;
                // //     for(let i = pva_start_idx; i < end_idx; i++){
                // //         curves.push(curves[i]);
                // //         paths.push({
                // //             ribbon:      paths[i].ribbon, 
                // //             speed:       c.speed, 
                // //             flow:        c.flow,
                // //             material:    'AIR',
                // //             cord_radius: c.cord_radius,
                // //         }); 
                // //     }
                // //     //paths = [...paths, ...air_paths];
                // //     pva_start_idx = -1;
                // // }
            }
            

            //c.surface = surface;
            //console.log(paths);
            console.log('Curves: '+curves.length);
            //for(let i=0; i < curves.length; i++){  
            //    console.log(curves[i].getLength());
            //}
            //console.log(paths);
            c.paths = paths;  // rename to ribbons ?!?!?!?!?!?!
            ax.curve = curves; // make curve an array of auxiliary curves ?!?!?!?!?!
            //ax.pts = sorted_pivots.map(p=> p.v);
            console.log('Reckoned Coil!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};



