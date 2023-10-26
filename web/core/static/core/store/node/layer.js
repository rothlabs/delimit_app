import {current} from 'immer';
import {Vector3, Shape, CurvePath, ShapeGeometry, Raycaster, PlaneGeometry, Mesh, MeshBasicMaterial, Float32BufferAttribute} from 'three';
import {LoopSubdivision} from '../../three/LoopSubdivision.js';
//import {TessellateModifier} from 'three/examples/jsm/modifiers/TessellateModifier';
//import {SimplifyModifier} from 'three/examples/jsm/modifiers/SimplifyModifier';
//import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils';
//import Delaunator from 'delaunator';

const v0 = new Vector3();
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const v5 = new Vector3();
//const v6 = new Vector3();

const origin = new Vector3();
const direction = new Vector3(0,0,-200);
const raycaster = new Raycaster();
const material = new MeshBasicMaterial();
const offsets = [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}]; // {x:0,y:-1} //{x:-1,y:0}
//const sketch_size = 400;
const res = 90;////140;
//const plane = new PlaneGeometry(sketch_size, sketch_size, grid_res-1, grid_res-1);
const shape_res = 900;


const n = {
    subject:  true,
    autocalc: true,
};
export const layer = n;
n.stem = ['shape', 'surface'];
n.part = (d, s, c)=>{ 
    if(d.design.act) return;

    //if(d.studio.mode == 'graph') throw new Error('In graph mode.');

    //const shape_res = (d.design.res=='low' ? 100 : this.shape_res);
    //const loop_div = (d.design.res=='low' ? 2 : this.layer_loop_div);

    //////const shape_res = Math.round(d.design.act ? this.shape_res * d.rapid_res : this.shape_res); // needed for realtime updates #1

    const c_pts = s.shape[0].p.shape.getSpacedPoints(shape_res); //getSpacedPoints
    

    //const surface  = d.n[d.n[n].n.surface[0]].c.surface;
    const shape_obj = new Mesh(
        new ShapeGeometry(s.shape[0].p.shape, Math.round(shape_res*0.5)), 
        material
    );

    const es = d.easel_size;//this.sketch_size;
    const r = Math.round(d.design.act ? res * d.rapid_res : res);
    //var geo = c.geo;
    //if(geo && d.design.moving){
    //    let pos = geo.attributes.position.array;
    //    for(let i=0; i<pos.length; i++) pos[i] = this.plane.attributes.position.array[i];
    //}else{
        var geo = new PlaneGeometry(es, es, r-1, r-1);
        //c.geo = geo;
        //ax.geo = geo;
    //}


    //const ray_pts = [];
    const pts = Array(r*r).fill(0);
    const pos = geo.attributes.position.array;
    const idx = geo.index.array;
    c_pts.forEach((p, ci)=>{
        offsets.forEach(offset=>{ // first run around with center only and then try offsets to catch stragelers if !epts[i] ?!?!?!?!
            let i = r*Math.round(r*(-p.y+es/2)/es + offset.y) + Math.round(r*(p.x+es/2)/es + offset.x);
            //if(!pts[i]){
                pts[i] = 1;
                pos[i*3  ] = p.x;
                pos[i*3+1] = p.y;
            //}
        });
    });
    for(let y=0; y < r; y++){
        let on_edge = false;
        let fill_start = -1;
        for(let x=0; x < r; x++){
            let i = r*y + x;
            if(pts[i] == 1) on_edge = true;
            if(on_edge && pts[i] == 0){
                    const ray_pt = new Vector3((x/r)*es-es/2, (-y/r)*es+es/2, 10); // try 1-() instead for readability 
                    origin.set(ray_pt.x, ray_pt.y, 100);
                    raycaster.set(origin, direction);
                    const intersects = raycaster.intersectObject(shape_obj);
                    //if(intersects.length > 0) ray_pts.push({pos:ray_pt, hit:true});
                    //else ray_pts.push({pos:ray_pt, hit:false});
                    if(intersects.length > 0) fill_start = i
                    on_edge = false;
            }
            if(fill_start > -1 && on_edge){
                for(let k=fill_start; k < i; k++) pts[k] = 2; //pos[k*3+2] = 10;
                fill_start = -1;
            }
        }
    }
    idx.fill(0);
    var i = 0;
    const fpos = pos.slice();
    function map_to_surface(...indices){
        indices.forEach(k=>{
            //v0.set(1-(fpos[k*3]+es/2)/es, (fpos[k*3+1]+es/2)/es, 0);
            s.surface[0].p.get_point_normal((fpos[k*3+1]+es/2)/es, 1-(fpos[k*3]+es/2)/es, v0, v1);
            v1.add(v0);
            // surface.get_point(v0.y,      v0.x,      v1);
            // surface.get_point(v0.y+.005, v0.x,      v2);
            // surface.get_point(v0.y,      v0.x+.005, v3);
            // v1.add(v2.sub(v1).cross(v3.sub(v1)).normalize());
            pos[k*3] = v1.x;   pos[k*3+1] = v1.y;   pos[k*3+2] = v1.z;
        });
    }
    for(let y=0; y < r-1; y++){
        for(let x=0; x < r-1; x++){
            let i0 = r*y + x;
            let i1 = i0+1;
            let i2 = r*(y+1) + x;
            let i3 = i2+1;
            if(pts[i0]>1 || pts[i1]>1 || pts[i2]>1){
                idx[i] = i0;
                idx[i+1] = i2;
                idx[i+2] = i1;
                i+=3;
                map_to_surface(i0, i2, i1);
            }
            if(pts[i1]>1 || pts[i3]>1 || pts[i2]>1){
                idx[i]   = i1;
                idx[i+1] = i2;
                idx[i+2] = i3;
                i+=3;
                map_to_surface(i1, i2, i3);
            }
            
        }
    }
    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
    geo.index.needsUpdate = true;
    
    return{geo:geo}
};




//v0.set(1-(pos[i0*3]+s/2)/s, (pos[i0*3+1]+s/2)/s, 0);

            // //const idx = [];
            // const index = geo.index.array;
            // const size = this.sketch_size;
            // const pba = geo.getAttribute('position');//.array;
            // for(let i=0; i<geo.index.count-3; i+=3){
            //     v0.fromBufferAttribute(pba, index[i]);
            //     //origin.set(pos[i], pos[i+1], 1);
            //     origin.set(v0.x, v0.y, 1);
            //     raycaster.set(origin, direction);
            //     const intersects = raycaster.intersectObject(shape_obj);
            //     if(intersects.length > 0){
            //         idx.push(index[i], index[i+1], index[i+2]); 
            //     }
            //     // v0.set(1-(v0.x+size/2)/size, (v0.y+size/2)/size, 0);
            //     // surface.get_point(v0.y,      v0.x,      v1);
            //     // surface.get_point(v0.y+.005, v0.x,      v2);
            //     // surface.get_point(v0.y,      v0.x+.005, v3);

            //     //pts.push(v1.clone().add(v2.sub(v1).cross(v3.sub(v1)).normalize())); 
            // }
            // //console.log(idx);
            // geo.setIndex( idx );
            
            //c.ray_pts = ray_pts;


// surface.get_point((fpos[i0*3+1]+s/2)/s, 1-(fpos[i0*3]+s/2)/s, v0);
// surface.get_point((fpos[i1*3+1]+s/2)/s, 1-(fpos[i1*3]+s/2)/s, v1);
// surface.get_point((fpos[i2*3+1]+s/2)/s, 1-(fpos[i2*3]+s/2)/s, v2);
// let normal = v3.copy(v1).sub(v0).cross(v4.copy(v2).sub(v0)).normalize();
// v0.add(normal);     v1.add(normal);     v2.add(normal);
// pos[i0*3] = v0.x;   pos[i0*3+1] = v0.y;   pos[i0*3+2] = v0.z;
// pos[i1*3] = v1.x;   pos[i1*3+1] = v1.y;   pos[i1*3+2] = v1.z;
// pos[i2*3] = v2.x;   pos[i2*3+1] = v2.y;   pos[i2*3+2] = v2.z;


// let prev_pt = pts[i]-1;
                        // if(prev_pt < 0) prev_pt = c_pts.length-1;
                        // let next_pt = pts[i]+1;
                        // if(next_pt > c_pts.length-1) next_pt = 0;
                        // if(c_pts[pts[i]].y > c_pts[prev_pt].y && c_pts[pts[i]].y < c_pts[next_pt].y) on_edge = true;
                        // if(c_pts[pts[i]].y < c_pts[prev_pt].y && c_pts[pts[i]].y > c_pts[next_pt].y) on_edge = true;
                        //if(pts[r*(y-1)+x-1]==1 || pts[r*(y-1)+x]==1 || pts[r*(y-1)+x+1]==1){
                        //    if(pts[r*(y+1)+x-1]==1 || pts[r*(y+1)+x]==1 || pts[r*(y+1)+x+1]==1){

//geo.setAttribute('position', new Float32BufferAttribute(pos,3));
            //geo.setIndex(idx);


//const plane = new PlaneGeometry(this.sketch_size, this.sketch_size, this.res-1, this.res-1);


// for(let y=0; y < r-1; y++){
//     for(let x=0; x < r-1; x++){
//         let i0 = r*y + x;
//         let i1 = i0+1;
//         let i2 = r*(y+1) + x;
//         let i3 = i2+1;
//         if(pts[i0]>1 || pts[i1]>1 || pts[i2]>1) idx.push(i0, i1, i2);
//         if(pts[i1]>1 || pts[i3]>1 || pts[i2]>1) idx.push(i1, i3, i2);
//     }
// }

// if(Math.abs(c_pts[pts[i]].y - c_pts[prev_pt].y) > 0.001){
//     if(Math.abs(c_pts[pts[i]].y - c_pts[next_pt].y) > 0.001){


            // const pts = [];
            // const size = this.sketch_size;
            // const pba = geo.getAttribute('position');
            // for(let i=0; i<pba.count; i++){
            //     v0.fromBufferAttribute(pba,i);
            //     origin.set(v0.x, v0.y, 1);
            //     raycaster.set(origin, direction);
            //     const intersects = raycaster.intersectObject(shape_obj);
            //     if(intersects.length < 1) continue;
            //     v0.set(1-(v0.x+size/2)/size, (v0.y+size/2)/size, 0);
            //     surface.get_point(v0.y,      v0.x,      v1);
            //     surface.get_point(v0.y+.005, v0.x,      v2);
            //     surface.get_point(v0.y,      v0.x+.005, v3);
            //     pts.push(v1.clone().add(v2.sub(v1).cross(v3.sub(v1)).normalize()));
            // }
            // geo.setFromPoints(pts);
            // geo.computeVertexNormals();


// const params = {
//     split:          true,       // optional, default: true
//     uvSmooth:       false,      // optional, default: false
//     preserveEdges:  false,      // optional, default: false
//     flatOnly:       true,      // optional, default: false
//     maxTriangles:   Infinity,   // optional, default: Infinity
// };


            //geo = LoopSubdivision.modify(geo, loop_div, params);
            //geo = mergeVertices(geo); // try this in progressive stages of greater tolerance ?!?!?!?!
            //const tessellate = new TessellateModifier(100, 1);
            //geo = tessellate.modify(geo);
            //geo = mergeVertices(geo);

            //const count = Math.floor( geo.attributes.position.count * 0.5 );
            //const simplify = new SimplifyModifier();
            //geo = simplify.modify(geo, count);

//if(c.matrix) pts = pts.map(p=> p.clone().applyMatrix4(c.matrix));
//ax.shape = new Shape(ax_pts);
            //if(ax.matrix) ax.shape = new Shape(pts.map(p=> p.clone().applyMatrix4(ax.matrix)));
            //else ax.shape = c.shape;
            //console.log('made shape!!!');

//var amt = ((point1.distanceTo(r1[0]) - point1.distanceTo(r1.at(-1))) / endpoint_dist1 + 1) / 2;
                        //var amt = ribs[k].curve.getLengths(this.rib_res)[j] / ribs[k].curve.getLength();
                        //amt = ((point2.distanceTo(r2[0]) - point2.distanceTo(r2.at(-1))) / endpoint_dist2 + 1) / 2;
                        //var amt = ribs[k+1].curve.getLengths(this.rib_res)[j] / ribs[k+1].curve.getLength();



//c.geo = new ParametricGeometry(getSurfacePoint, this.tri_res, this.tri_res);
            //if(c.inner_view) c.geo.index.array.reverse();
            //c.geo.computeVertexNormals();



            // const prfl = ribs[0].pts.reverse().concat(prfl1, ribs.at(-1).pts, prfl2.reverse());
            // for(let i=0; i<ribs.length; i++){
            //     pts = pts.concat(ribs[i].pts);
            // };
            // var geo = new BufferGeometry().setFromPoints(pts);
            // if(c.matrix) geo.applyMatrix4(c.matrix);
            // var tri = Delaunator.from(pts.map(v=> [v.x, v.y])).triangles;
            // var idx = []; 
            // for (let i = 0; i < tri.length-3; i+=3){
            //     let o1 = prfl.indexOf(pts[tri[i]]), o2 = prfl.indexOf(pts[tri[i+1]]), o3 = prfl.indexOf(pts[tri[i+2]]);
            //     if(o1>-1 && o2>-1 && Math.abs(o1-o2)>1) continue;
            //     if(o2>-1 && o3>-1 && Math.abs(o2-o3)>1) continue;
            //     if(o3>-1 && o1>-1 && Math.abs(o3-o1)>1) continue;
            //     idx.push(tri[i], tri[i+2], tri[i+1]); // delaunay index => three.js index
            // }
            // geo.setIndex(idx);
            // geo.computeVertexNormals();
            // c.geo = geo;



            // const bndry  = d.n[n].n.curve.map(n=>({
            //     used: false,
            //     pts: d.n[n].l.curve.getPoints(this.boundary_res),
            // }));
            // var pts = [...bndry[0].pts];
            // bndry[0].used = true;
            // var i = 1;
            // while(i < bndry.length){
            //     if(!bndry[i].used){
            //         if(pts.at(-1).distanceTo(bndry[i].pts[0]) < this.max_dist) {
            //             bndry[i].used = true;
            //             pts = pts.concat(bndry[i].pts); 
            //             i = 0;
            //         }else if(pts.at(-1).distanceTo(bndry[i].pts.at(-1)) < this.max_dist){
            //             bndry[i].used = true;
            //             pts = pts.concat(bndry[i].pts.reverse());
            //             i = 0;
            //         }
            //     }
            //     i++;
            // }
            // var geo2 = new ShapeGeometry(new Shape(pts));
            // if(c.matrix) geo2.applyMatrix4(c.matrix);
            // c.geo2 = geo2;


                    
            


            //c.shape = new Shape(pts);
            // console.log(c.shape);

            //console.log(curves);
            //const curve_path = new CurvePath(curves);
            //console.log(curve_path);
            //const points = curve_path.getPoints(this.profile_res);
            //console.log(points);
            //c.shape = new Shape(new CurvePath(curves).getPoints(this.profile_res));

            // var pts = [];
            // var res_h = 0;
            // // sort ribs by Y
            // const ribs = d.n[n].n.mixed_curve.map(n=>{
            //     let pts = d.n[n].w.curve.getPoints();
            //     return {
            //         n: n,
            //         pts: c.pts,
            //         h: c.pts.reduce((a,b)=>a.y+b.y,0),
            //     }
            // }).sort((a,b)=>a.h-b.h);
            // // build pts list for surface
            // for(let i=0; i<ribs.length-1; i++){
            //     pts = pts.concat(ribs[i].pts);
            //     res_h++;
            // };
            // c.pts = pts;
            // c.res_w = d.n[ribs[0].n].c.pts.length-1;
            // c.res_h = res_h-1;
            // //console.log('reckon surf');
            // //console.log('ribs gds', ribs, rails);


// function transform_points(pts){
                    //     if(d.n[ribs[0].n].c.matrix) return pts.map(p=>p.applyMatrix4(d.n[ribs[0].n].c.matrix));
                    //     return pts;
                    // }

// export const surface = {
//     //res_w: 100,//d.reckon.curve.res,
//     res_h: 10,
//     surface(d,n,cause=''){ // need indicator on how to order ribs ?!?!?!?! (ordering by y right now)
//         try{//if(cause.includes('curve') || ['make.edge', 'delete.edge'].includes(cause)){ 
//             //const ribs = d.n[n].n.mixed_curve;//.filter(n=> !c.guide);
//             const rail  = d.n[n].n.curve;//.filter(n=>  c.guide);
//             var pts = [];
//             var res_h = 0;
//             // sort ribs by Y
//             const ribs = d.n[n].n.mixed_curve.map(n=>{
//                 let pts = d.n[n].w.curve.getPoints();
//                 return {
//                     n: n,
//                     pts: c.pts,
//                     h: c.pts.reduce((a,b)=>a.y+b.y,0),
//                 }
//             }).sort((a,b)=>a.h-b.h);
//             // build pts list for surface
//             for(let i=0; i<ribs.length-1; i++){
//                 pts = pts.concat(ribs[i].pts);
//                 res_h++;
//             };
//             c.pts = pts;
//             c.res_w = d.n[ribs[0].n].c.pts.length-1;
//             c.res_h = res_h-1;
//             //console.log('reckon surf');
//             //console.log('ribs gds', ribs, rails);
//         }catch(e){console.log(e)}
//     },
// };