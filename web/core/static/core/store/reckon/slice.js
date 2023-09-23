import {current} from 'immer';
import {Vector3, Vector2, Matrix4, MathUtils, Color, CatmullRomCurve3, Box3, 
        Mesh, MeshBasicMaterial, Line3, Plane, LineCurve3, CurvePath, BufferGeometry, PlaneGeometry} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';
//import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler';
import gpuJs from 'gpu';

import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, SAH } from 'three-mesh-bvh';
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

const point = new Vector3();
const normal = new Vector3();
const origin = new Vector3();
const up = new Vector3(0,1,0);

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
gpu.addFunction(function crs_vct(ax, ay, az, bx, by, bz) {
    var x = ay*bz - az*by;
    var y = az*bx - ax*bz;
    var z = ax*by - ay*bx;
    var dist = Math.sqrt(x*x + y*y + z*z);
    return [x/dist, y/dist, z/dist];
},{argumentTypes: {ax:'Number', ay:'Number', az:'Number', bx:'Number', by:'Number', bz:'Number'}, returnType:'Array(3)'});



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
            

            console.log('Slice: src_edges'); 
            const plane = new PlaneGeometry(d.easel_size, d.easel_size); //, d.easel_size/2, d.easel_size/2
            plane.computeBoundsTree( { maxLeafTris: 1, strategy: SAH } );
            const conforms = [];
            const src_edges = [];
            surfaces.forEach(surface => {
                const conform = new ParametricGeometry(surface.get_point, surface_div, surface_div);
                conform.computeBoundsTree( { maxLeafTris: 1, strategy: SAH } );
                conforms.push(conform);
            });
            axes.forEach((axis, ai)=>{
                for(let si = -d.easel_size/2; si < d.easel_size/2; si += slice_div){
                    m1.lookAt(origin, axis.v, up).multiply(
                        m2.makeTranslation(v1.copy(axis.v).multiplyScalar(si))
                    );
                    conforms.forEach(conform=>{
                        conform.boundsTree.bvhcast(plane.boundsTree, m1, {
                            intersectsTriangles( triangle1, triangle2, i1, i2 ){
                                if(triangle1.intersectsTriangle(triangle2, edge)){
                                    src_edges[ai][si].push({
                                        p1: edge.start.clone(),
                                        p2: edge.end.clone(),
                                        i1: i1,
                                        i2: i2,
                                        n:  triangle1.getNormal(v1).clone(),
                                    });
                                }
                            }
                        });
                    });
                }
            });
            console.log('Slice: src_edges done');
            console.log(src_edges);

            

            console.log('Slice: paths');
            var inside = true;
            var ref_pnt = src_paths[0][0][0][0].p;
            var pva_start_idx = -1;
            for(let li=0; li<c.layers; li++){ 
                for(let ai=0; ai<c.axes; ai++){ 
                    for(let pth=0; pth < src_paths[li][ai].length; pth++){ 
                        var src_path = src_paths[li][ai][pth];
                        var pts = [[],[],[]]; // could just be 3 with second v as center line ?!?!?!?!?!
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
                            if(inside){// && dist > min_div){ // check for end_surface !!!!!!!
                                //ref_pnt = src_path[i].p.clone();
                                //if(hit_outside) bnd_vox[k].p.projectPoint(src_path[i].p, ref_pnt);
                                //box.expandByPoint(ref_pnt);
                                pts[0].push(src_path[i].p.clone());
                                pts[1].push(src_path[i].p.clone().add(v1.copy(src_path[i].n).divideScalar(2))); 
                                pts[2].push(src_path[i].p.clone().add(src_path[i].n));
                            }
                            if((!inside || i == src_path.length-1)){// && box.getSize(v1).length() > min_size){
                                //console.log(pts[0].length);
                                if(pts[0].length > 2){
                                    var curve = new CatmullRomCurve3(pts[0]); // use nurbs curve?! #1
                                    curve.arcLengthDivisions = 3000; // make this dynamic #1
                                    //if(curve.getLength() > min_length){
                                        curves.push(curve);
                                        if(pva_start_idx < 0 && c.material == 'PVA') pva_start_idx = paths.length;
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
                            ref_pnt = src_path[i].p; // clone? #1
                        }
                    }
                }
                if(pva_start_idx > -1){
                    //const air_paths = [];
                    let end_idx = paths.length;
                    for(let i = pva_start_idx; i < end_idx; i++){
                        curves.push(curves[i]);
                        paths.push({
                            ribbon:      paths[i].ribbon, 
                            speed:       c.speed, 
                            flow:        c.flow,
                            material:    'AIR',
                            cord_radius: c.cord_radius,
                        }); 
                    }
                    //paths = [...paths, ...air_paths];
                    pva_start_idx = -1;
                }
            }
            

            //c.surface = surface;
            //console.log(paths);
            console.log('Curves: '+curves.length);
            //for(let i=0; i < curves.length; i++){  
            //    console.log(curves[i].getLength());
            //}
            c.paths = paths;  // rename to ribbons ?!?!?!?!?!?!
            ax.curve = curves; // make curve an array of auxiliary curves ?!?!?!?!?!
            //ax.pts = sorted_pivots.map(p=> p.v);
            console.log('Reckoned Coil!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};



