import {current} from 'immer';
import {Vector3, Vector2, Matrix4, MathUtils, Color, CatmullRomCurve3, Box3, DoubleSide, Sphere, Triangle,
        Mesh, MeshBasicMaterial, Line3, Plane, LineCurve3, CurvePath, Raycaster, BufferGeometry, PlaneGeometry} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';
//import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler';
import gpuJs from 'gpu';

import {computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVH, 
    SAH, CENTER, AVERAGE, NOT_INTERSECTED, INTERSECTED, getTriangleHitPointInfo} from 'three-mesh-bvh';
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

const seg = new Line3();
const tri1 = new Triangle();

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
material.side = DoubleSide;
const color = new Color();
const vector2 = new Vector2();

const raycaster = new Raycaster();
raycaster.firstHitOnly = true;

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
    props: ['axis_x', 'axis_y', 'axis_z', 'density', 'speed', 'flow', 
        'cord_radius', 'layers', 'axes', 'spread_angle', 'material', 'offset'],
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
            const layer_div = (c.cord_radius*2) * 0.8;
            const slice_div = (c.cord_radius*2) / c.density; 
            //const half_slice_cnt = Math.round(d.easel_size/slice_div/2);
            const curves = [];
            

            console.log('Slice: axes');
            const axes = [];
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
                axis_t.applyAxisAngle(axis, Math.PI*2 / c.axes);
            }
            // const axes_x = axes.map(axis=> axis.axis.x);
            // const axes_y = axes.map(axis=> axis.axis.y);
            // axes.map(axis=> axis.axis.z);

            if(c.fill){
                var sn = d.n[n].n.surface; // surface nodes
                var aon = sn.reduce((sum, sn)=> sum + d.n[sn].c.order, 0) / sn.length; // average order number (for surfaces)
                surfaces = [];
                var bnds = [];
                sn.forEach(sn=> {
                    if(d.n[sn].c.order < aon){
                        surfaces.push(d.n[sn].c.surface)
                    }else{ 
                        const geo = new ParametricGeometry(
                            d.n[sn].c.surface.get_point, 
                            surface_div, 
                            surface_div,
                        );
                        //geo.computeBoundsTree({maxLeafTris: 1, strategy: SAH});
                        //bnds.push(new Mesh(geo, material));
                        bnds.push({
                            geo: geo,
                            bvh: new MeshBVH(geo),
                        });
                    }
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
                m1.makeRotationAxis(v1, -forward.angleTo(axes[ai].v));
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
                                if(triangle1.intersectsTriangle(triangle2, seg)){
                                    triangle1.getNormal(normal);
                                    seg.applyMatrix4(m2);
                                    normal.applyMatrix4(m2);
                                    dir.copy(seg.end).sub(seg.start).normalize();
                                    v1.copy(dir).cross(normal).normalize();
                                    if(v1.dot(axes[ai].v) > 0){
                                        segs[ai].at(-1).push(
                                            seg.start.x,
                                            seg.start.y,
                                            seg.start.z,
                                            seg.end.x,
                                            seg.end.y,
                                            seg.end.z,
                                        );
                                    }else{
                                        segs[ai].at(-1).push(
                                            seg.end.x,
                                            seg.end.y,
                                            seg.end.z,
                                            seg.start.x,
                                            seg.start.y,
                                            seg.start.z,
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
            }
            console.log('Slice: fill empty');
            const slice_cnt = segs[0].length;
            for(let ai = 0; ai < c.axes; ai++){
                for(let si = 0; si < slice_cnt; si++){
                    //segs[ai][si].sort((a,b)=> a[3]-b[3]);
                    const empty = new Array((max_seg_cnt - segs[ai][si][0])*9 + 1).fill(0);
                    segs[ai][si] = [...segs[ai][si], ...empty];
                }
            }
            console.log('Slice: segs done');
            //console.log(segs);

            console.log('Slice: links'); 
            const compute_links = gpu.createKernel(function(segs){
                var sme  = -1; 
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
                    var preceded  = false;
                    var succeeded = false;
                    for(let i = 0; i < segs[ai][si][0]; i++){ 
                        var i2 = i * 9;
                        if(i1 != i2){
                            var dx1 = segs[ai][si][i2+4] - x1;
                            var dy1 = segs[ai][si][i2+5] - y1;
                            var dz1 = segs[ai][si][i2+6] - z1;
                            var dx2 = segs[ai][si][i2+1] - x2;
                            var dy2 = segs[ai][si][i2+2] - y2;
                            var dz2 = segs[ai][si][i2+3] - z2;
                            if(Math.sqrt(dx1*dx1 + dy1*dy1 + dz1*dz1) == 0){
                                preceded = true;
                            }
                            if(Math.sqrt(dx2*dx2 + dy2*dy2 + dz2*dz2) == 0){
                                succeeded = true;
                                next = i;
                            }
                        }
                    } 
                    if(succeeded && !preceded){
                        sme = 0; // start seg
                    }else if(succeeded && preceded){
                        sme = 1; // middle seg
                    }else if(!succeeded && preceded){
                        sme = 2; // end seg
                    }
                }
                return [sme, next];
            },{
                tactic: 'precision',
                loopMaxIterations: max_seg_cnt,
                output: {x:max_seg_cnt, y:slice_cnt, z:c.axes}, // order is switched around on output for some reason
            }); 
            const links = compute_links(segs);

            var src_paths = new Array(c.layers).fill(0).map(()=> []);
            // for(let li = 0; li < c.layers; li++){
            //     src_paths.push([]);
            // }
            //const seqs = [];
            function make_slice(ai, si){
                const seq = [];//seqs[ai].push([]);
                const starts = [];
                //const ends = [];
                for(let i = 0; i < segs[ai][si][0]; i++){
                    if(links[ai][si][i][0] == 0) starts.push(i);
                    //if(links[ai][si][i][0] == 2) ends.push(i);
                }
                //console.log('starts ends', starts.length, ends.length);
                //if(starts.length != ends.length) continue;
                var used = new Array(segs[ai][si][0]).fill(false);
                function make_sequence(i){
                    seq.push([]);//seqs[ai][si].push([]);
                    function insert_sequence_item(k, o){
                        k *= 9;
                        seq.at(-1).push({//seqs[ai][si].at(-1).push({
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
                        make_sequence(i);
                        return true;
                    }) == undefined) break;
                }
                for(let li = 0; li < c.layers; li++){
                    for(let pi = 0; pi < seq.length; pi++){
                        var path = [];
                        for(let i = 0; i < seq[pi].length; i++){
                            if(i < seq[pi].length-1){
                                v1.copy(seq[pi][i+1].p).sub(seq[pi][i].p).negate()
                                    .cross(axes[ai].v).normalize().multiplyScalar((li+c.offset)*layer_div);
                                //v1.copy(seq[pi][i].n).multiplyScalar((li+0.5)*layer_div);
                            }
                            path.push({
                                p: seq[pi][i].p.clone().add(v1),
                                n: seq[pi][i].n,
                            });
                        }
                        src_paths[li].push(path);
                    }
                }
                
            }
            for(let ai = 0; ai < c.axes; ai++){
                for(let si = 0; si < slice_cnt; si++){
                    if(segs[ai][si][0]) make_slice(ai, si);
                }
            }

            if(c.fill){
                var target0 = {pnt: new Vector3(), idx:-1, geo:null};
                var target1 = {};
                var target2 = {};
                console.log('Slice: cut to boundary');
                const trimmed = new Array(c.layers).fill(0).map(()=> []);
                var inside = true;
                for(let li=0; li<c.layers; li++){ 
                    for(let pi=0; pi < src_paths[li].length; pi++){
                        trimmed[li].push([]);
                        for(let i=0; i < src_paths[li][pi].length; i++){
                            var pnt = src_paths[li][pi][i].p;
                            //var nml = src_paths[li][pi][i].n;
                            var closest = Infinity;
                            
                            bnds.forEach(bnd=>{
                                bnd.bvh.closestPointToPoint(pnt, target1, 0, Infinity);
                                if(closest > target1.distance){
                                    closest = target1.distance;
                                    target0.pnt.copy(target1.point);
                                    target0.idx = target1.faceIndex;
                                    target0.geo = bnd.geo;
                                    //target0 = {pnt:target1.point.clone(), idx:target1.faceIndex, geo:bnd.geo};
                                }
                            });
                            dir.copy(target0.pnt).sub(pnt).normalize();
                            getTriangleHitPointInfo(target0.pnt, target0.geo, target0.idx, target2);
                            // function add_intersection_point(){
                            //     if(!trimmed[li].at(-1).at(-1)) return;
                            //     trimmed[li].at(-1).push({
                            //         p: target0.pnt,
                            //         n: trimmed[li].at(-1).at(-1).n,
                            //     });
                            // }
                            if(target2.face.normal.dot(dir) > 0){
                                if(!inside){
                                    inside = true;
                                    //add_intersection_point();
                                }
                                trimmed[li].at(-1).push(src_paths[li][pi][i]);
                            }else{
                                if(inside){
                                    inside = false;
                                    //add_intersection_point();
                                    trimmed[li].push([]);
                                }
                            }
                        }
                    }
                }
                src_paths = trimmed;
            }



            console.log('Slice: paths');
            var paths = []; 
            //var inside = true;
            //var ref_pnt = src_paths[0][0][0][0].p;
            var pva_start_idx = -1;
            function make_path(src_path){
                if(src_path.length < 3) return;
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
                    // if(i == src_path.length-1){
                    //     //console.log(pts[0].length);
                    //     if(pts[0].length > 1){
                    //         var curve = new CatmullRomCurve3(pts[0]); // use nurbs curve?! #1
                    //         curve.arcLengthDivisions = 3000; // make this dynamic #1
                    //         //if(curve.getLength() > min_length){
                    //             curves.push(curve);
                    //             //console.log(curve);
                    //             //if(pva_start_idx < 0 && c.material == 'PVA') pva_start_idx = paths.length;
                    //             paths.push({
                    //                 ribbon:      d.geo.surface(d, pts, {length_v:curve.getLength()}), 
                    //                 speed:       c.speed, 
                    //                 flow:        c.flow,
                    //                 material:    c.material,
                    //                 cord_radius: c.cord_radius,
                    //             }); 
                    //         //}
                    //     }
                    //     if(pts[0].length > 0) pts = [[],[],[]];
                    // }
                    //ref_pnt = src_path[i].p; // clone? #1
                }
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
            }
            for(let li=0; li<c.layers; li++){ 
                //for(let ai=0; ai<c.axes; ai++){ 
                    //for(let si=0; si<src_paths[li][ai].length; si++){
                        for(let pi=0; pi < src_paths[li].length; pi++){ 
                            //var src_path = src_paths[li][ai][si][pth];
                            make_path(src_paths[li][pi]);
                        }
                    //}
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




// if(c.fill){
//     var target1 = {};
//     var target2 = {};
//     console.log('Slice: cut to boundary');
//     const trimmed = new Array(c.layers).fill(0).map(()=> []);
//     var inside = true;
//     for(let li=0; li<c.layers; li++){ 
//         for(let pi=0; pi < src_paths[li].length; pi++){
//             trimmed[li].push([]);
//             for(let i=0; i < src_paths[li][pi].length; i++){
//                 var pnt = src_paths[li][pi][i].p;
//                 var closest = Infinity;
//                 var target0 = null;
//                 bnds.forEach(bnd=>{
//                     bnd.bvh.closestPointToPoint(pnt, target1, 0, Infinity);
//                     if(closest > target1.distance){
//                         closest = target1.distance;
//                         target0 = {pnt:target1.point.clone(), idx:target1.faceIndex, geo:bnd.geo};
//                     }
//                 });
//                 dir.copy(target0.pnt).sub(pnt).normalize();
//                 getTriangleHitPointInfo(target0.pnt, target0.geo, target0.idx, target2);
//                 if(target2.face.normal.dot(dir) > 0){
//                     inside = true;
//                     trimmed[li].at(-1).push(src_paths[li][pi][i]);
//                 }else{
//                     if(inside){
//                         inside = false;
//                         trimmed[li].push([]);
//                     }
//                 }
//             }
//         }
//     }
//     src_paths = trimmed;
// }


                                // bnd.shapecast({
                                //     intersectsBounds: ( box, isLeaf, score, depth, nodeIndex ) => {
                                //         if(box.intersectsTriangle(tri1)){
                                //             return INTERSECTED;
                                //         }
                                //         return NOT_INTERSECTED;
                                //     },
                                //     intersectsTriangle(tri0){
                                //         //console.log('hey!!!!');
                                //         if(tri0.intersectsTriangle(tri1, seg)){
                                //             if(trimmed[li].at(-1).at(-1)){
                                //                 //console.log('fit to surface!');
                                //                 trimmed[li].at(-1).push({
                                //                     p: seg.start.clone(),
                                //                     n: trimmed[li].at(-1).at(-1).n,
                                //                 });
                                //             }
                                //             tri0.getNormal(normal);
                                //             if(normal.dot(dir) > 0){
                                //                 inside = false;
                                //                 trimmed[li].push([]);
                                //             }else{  
                                //                 inside = true;
                                //             }
                                //             return true;
                                //         }
                                //         return false;
                                //     }
                                // });



// if(c.fill){
//     console.log('Slice: cut to boundary');
//     const trimmed = new Array(c.layers).fill(0).map(()=> []);
//     var ref_pnt = src_paths[0][0][0].p;
//     var last_dist = 0;
//     var inside = true;
//     for(let li=0; li<c.layers; li++){ 
//         for(let pi=2; pi < src_paths[li].length; pi++){
//             trimmed[li].push([]);
//             console.log('checking path');
//             for(let i=1; i < src_paths[li][pi].length; i++){
                
//                 //if(i < src_paths[li][pi].length-1){
                    
//                     dir.copy(src_paths[li][pi][i].p).sub(ref_pnt);
//                     var dist = dir.length();
//                     dir.normalize();
//                     raycaster.set(ref_pnt, dir);
//                 //}

//                 //console.log('raycast');
//                 // bnds.forEach(bnd=>{
//                 //     var hit = bnd.raycastFirst(raycaster.ray, DoubleSide);
//                 //     if(hit){
//                 //         if(hit.point.distanceTo(ref_pnt) <= dist){
//                 //             console.log(hit.normal.dot(dir));
//                 //             if(hit.normal.dot(dir) > 0){
//                 //                 inside = false;
//                 //             }else{
//                 //                 inside = true;
//                 //             }
//                 //         }
//                 //     }
//                 // });

//                 var intersects = raycaster.intersectObjects(bnds);
//                 if(intersects[0]){
//                     console.log(intersects[0].normal.dot(dir));
//                     //if(intersects[0].normal.dot(dir) > 0){
//                     //    inside = false;
//                     //}else{
//                         //inside = true;
//                         if(intersects[0].point.distanceTo(ref_pnt) <= dist) inside = true;
//                     //}
//                 }

//                 //dir.copy(src_paths[li][pi][i-2].p).sub(ref_pnt).normalize();
//                 //var dist = dir.length();
//                 dir.negate();
//                 raycaster.set(ref_pnt, dir);
//                 //}

//                 //console.log('raycast');
//                 intersects = raycaster.intersectObjects(bnds);
//                 if(intersects[0]){
//                     if(intersects[0].point.distanceTo(ref_pnt) <= last_dist) inside = false;
//                     //if(intersects[0].normal.dot(dir) > 0){
//                     //    inside = true;
//                     //}else{
//                     //    inside = true;
//                     //}
//                 }

//                 if(inside) trimmed[li].at(-1).push(src_paths[li][pi][i]);
//                 ref_pnt = src_paths[li][pi][i].p;
//                 last_dist = dist;
//             }
//         }
//     }
//     src_paths = trimmed;
// }






                // const reduced = [];
                // const max_dist = 0.001;
                // var used = new Array(rough.length).fill(false);
                // function connect_sequence(j, k){
                //     if(reduced[j][0].p.distanceTo(rough[k][0].p) < max_dist){
                //         reduced[j] = [...rough[k].reverse(), ...reduced[j]];
                //         used[k] = true;
                //         k = 0;
                //     }else if(reduced[j][0].p.distanceTo(rough[k].at(-1).p) < max_dist){
                //         reduced[j] = [...rough[k], ...reduced[j]];
                //         used[k] = true;
                //         k = 0;
                //     }else if(reduced[j].at(-1).p.distanceTo(rough[k][0].p) < max_dist){
                //         reduced[j] = [...reduced[j], ...rough[k]];
                //         used[k] = true;
                //         k = 0;
                //     }else if(reduced[j].at(-1).p.distanceTo(rough[k].at(-1).p) < max_dist){
                //         reduced[j] = [...reduced[j], ...rough[k].reverse()];
                //         used[k] = true;
                //         k = 0;
                //     }
                // }
                // var j = -1;
                // for(let i = 0; i < rough.length; i++){
                //     if(used[i] && rough[i].length) continue;
                //     reduced.push(rough[i]);
                //     j++;
                //     for(let k = 0; k < rough.length; k++){
                //         if(used[k] || i == k) continue;
                //         connect_sequence(j, k);
                //     }
                // }

                //seqs[ai][si] = reduced;
                //src_paths[0] = [...src_paths[0], ...reduced]; 
                //var paths = [];
                
                //src_paths[li][ai] = [];
                //const slice = [];

                //var reduced = rough;