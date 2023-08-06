import {current} from 'immer';
import {Vector3, Vector4, CatmullRomCurve3, Shape, CurvePath, BufferGeometry, ShapeGeometry} from 'three';
import {NURBSSurface} from 'three/examples/jsm/curves/NURBSSurface';
//import Delaunator from 'delaunator';
//import { closest } from '../../junk/vertex.js';

const v1 = new Vector3();
const v2 = new Vector3();
//const v3 = new Vector3();
//const v4 = new Vector3();
//const v5 = new Vector3();
//const v6 = new Vector3();

export const surface = {
    rib_res: 40,
    rail_res: 60, // rail_res
    loop_res: 12,
    node(d,n,cause=[]){ // need indicator on how to order ribs ?!?!?!?! (ordering by y right now)
        try{if(cause[0]!='casted_matrix'){ 
            delete d.n[n].c.surface;

            var pts = [];

            var rib_source = [];
            if(d.n[n].n.mixed_curve) rib_source = rib_source.concat(d.n[n].n.mixed_curve);
            if(d.n[n].n.ellipse) rib_source = rib_source.concat(d.n[n].n.ellipse);

            const all_ribs = rib_source.map(n=>{
                const points = d.n[n].c.mixed_curve.getSpacedPoints(this.rib_res-1); //getSpacedPoints
                if(points[0].z > points.at(-1).z) points.reverse();
                const tmp_pts = d.n[n].c.mixed_curve.getPoints(9);
                return {
                    pts: points,
                    x: tmp_pts.reduce((a,b)=>a+b.x,0)/10,
                    y: tmp_pts.reduce((a,b)=>a+b.y,0)/10, 
                }
            }).sort((a,b)=> a.x-b.x);
            const split_idx = Math.ceil(all_ribs.length/2);
            const io_ribs = [
                all_ribs.slice(0,split_idx).sort((a,b)=> ((-a.x*.1)+a.y)-((-b.x*.1)+b.y)),//.sort((a,b)=> a.y-b.y),
                all_ribs.slice(split_idx).sort((a,b)=> ((a.x*.1)+a.y)-((b.x*.1)+b.y))//.sort((a,b)=> a.y-b.y)//.sort((a,b)=> a.x-b.x)
            ];

            //console.log(io_ribs);

            if(d.n[n].n.curve?.length > 1){
                const guide = d.n[n].n.curve.map(n=>{//.filter(n=> d.n[n].c.guide).map(n=>{
                    const pts = d.n[n].c.curve.getPoints(this.rail_res);
                    if(pts[0].y > pts.at(-1).y) pts.reverse();
                    return {
                        pts: pts,
                        sub: [], // sub points between ribs
                        z: d.n[n].c.curve.getPoints(9).reduce((a,b)=>a+b.z,0)/10,
                    }
                }).sort((a,b)=>a.z-b.z);
                var idx1 = 0;
                var idx2 = 0;
                const ribs = io_ribs[0];
                for(let i=1; i<ribs.length; i++){
                    const loop_res = Math.round((ribs[i].y - ribs[i-1].y) / (ribs.at(-1).y - ribs[0].y) * (this.loop_res+1));
                    var closest = guide[0].pts.slice().sort((a,b)=> a.distanceTo(ribs[i].pts[0])-b.distanceTo(ribs[i].pts[0]))[0];
                    var idx = guide[0].pts.indexOf(closest);
                    //pts = pts.concat(new CatmullRomCurve3(guide[0].pts.slice(idx1,idx)).getSpacedPoints(this.loop_res+1));
                    //console.log('before error', closest, idx);
                    //if(idx1==idx) slice = guide[0].sub.push([guide[0].pts[idx], guide[0].pts[idx]]);
                    if(idx1==idx) guide[0].sub.push([]);
                    else guide[0].sub.push(new CatmullRomCurve3(guide[0].pts.slice(idx1,idx)).getSpacedPoints(loop_res)); 
                    idx1 = idx;
                    closest = guide[1].pts.slice().sort((a,b)=> a.distanceTo(ribs[i].pts.at(-1))-b.distanceTo(ribs[i].pts.at(-1)))[0];
                    idx = guide[1].pts.indexOf(closest);
                    //pts = pts.concat(new CatmullRomCurve3(guide[1].pts.slice(idx2,idx)).getSpacedPoints(this.loop_res+1));
                    //if(idx2==idx) slice = guide[1].sub.push([guide[1].pts[idx], guide[1].pts[idx]]);
                    if(idx2==idx) guide[1].sub.push([]);
                    else guide[1].sub.push(new CatmullRomCurve3(guide[1].pts.slice(idx2,idx)).getSpacedPoints(loop_res));
                    idx2 = idx;
                }
                var io_pts = [[],[]];
                const double_ribs = [];
                var rib_idx = 0;
                io_ribs.forEach((ribs,io)=>{
                    // make extra ribs in between existing ribs
                    //if(io==0) io_pts[io].push(ribs[0].pts); else io_pts[io].push(ribs[0].pts.slice().reverse());
                    io_pts[io].push(ribs[0].pts);
                    if(io==0) rib_idx++;
                    for(let k=0; k<ribs.length-1; k++){
                        var r1 = ribs[k].pts;
                        var r2 = ribs[k+1].pts;
                        var g1 = guide[0].sub[k];
                        var g2 = guide[1].sub[k];
                        //if(g1.length g1.length){
                            for(let i=1; i<g1.length-1; i++){
                                var a1 = v1.set(0,r1[0].y,r1[0].z).distanceTo(g1[i]) / v1.set(0,r1[0].y,r1[0].z).distanceTo(v2.set(0,r2[0].y,r2[0].z));
                                var a2 = v1.set(0,r1.at(-1).y,r1.at(-1).z).distanceTo(g2[i]) / v1.set(0,r1.at(-1).y,r1.at(-1).z).distanceTo(v2.set(0,r2.at(-1).y,r2.at(-1).z));
                                const endpoint1 = new Vector3(r1[0].x*(1-a1)+r2[0].x*a1, g1[i].y, g1[i].z); 
                                const endpoint2 = new Vector3(r1.at(-1).x*(1-a2)+r2.at(-1).x*a2, g2[i].y, g2[i].z); 
                                const delta1 = endpoint1.clone().sub(r1[0]);
                                const delta2 = endpoint2.clone().sub(r1.at(-1));
                                const delta3 = endpoint1.clone().sub(r2[0]); // don't need to clone here ?!?!?!?
                                const delta4 = endpoint2.clone().sub(r2.at(-1)); // don't need to clone here ?!?!?!
                                const new_rib = [];
                                for (let j=0; j < r1.length; j++) { // change to rib_res ?!?!?!
                                    var amt = j/r1.length;
                                    var point1 = r1[j].clone();
                                    var np1 = point1.add(delta1.clone().multiplyScalar(1-amt)).add(delta2.clone().multiplyScalar(amt));
                                    var point2 = r2[j].clone();
                                    var np2 = point2.add(delta3.clone().multiplyScalar(1-amt)).add(delta4.clone().multiplyScalar(amt));
                                    amt = i/(g1.length-1);
                                    var np  = np1.multiplyScalar(1-amt).add(np2.multiplyScalar(amt));
                                    new_rib.push(np);
                                }
                                //pts.push(new_rib);
                                //if(io==0) io_pts[io].push(new_rib); else io_pts[io].push(new_rib.reverse());
                                io_pts[io].push(new_rib);
                                if(io==0) rib_idx++;
                            }
                        //}
                        //pts.push(r2);
                        //if(io==0) io_pts[io].push(r2); else io_pts[io].push(r2.slice().reverse());
                        io_pts[io].push(r2);
                        if(io==0){// && k<ribs.length-2){ // this will prevent top from being double loop!!!!
                            double_ribs.push(rib_idx);
                        }
                        rib_idx++;
                    }
                });
                for(let i=0; i < io_pts[0].length; i++){
                    const half = io_pts[0][i].reverse().slice(1);
                    pts.push([...io_pts[1][i], ...half]);
                    if(double_ribs.includes(i)){
                        //console.log('double loop!!!!');
                        pts.push([...io_pts[1][i], ...half]);
                    }
                }
            }else{
                //pts = all_ribs.map(rib=> rib.pts);
                //if(pts.length < 3) pts.push(all_ribs.at(-1).pts);
                //pts.push([...io_ribs[1][0].pts, ...io_ribs[0][0].pts.reverse().slice(1)]);
                for(let i=0; i < io_ribs[0].length; i++){
                    const half = io_ribs[0][i].pts.reverse().slice(1);
                    //if(i>0) io_ribs[0][i].pts.reverse();
                    //const half = io_ribs[0][i].pts.reverse().slice(1);
                    pts.push([...io_ribs[1][i].pts, ...half]);//...io_ribs[0][i].pts.slice(1)]);
                    //if(double_ribs.includes(i)){
                        //console.log('double loop!!!!');
                        pts.push([...io_ribs[1][i].pts, ...half]);//...io_ribs[0][i].pts.slice(1)]);
                    //}
                }
                //pts.push([...io_ribs[1].at(-1).pts, ...io_ribs[0].at(-1).pts.slice(1)]);
            }

            var degree1 = 2;
            var degree2 = 2;
            //var knots1 = [0, 0, 0, 1, 1, 1];
            var knots1 = [0,0];
            // if(pts.length < 3){
            //     degree1 = 1;
            //     knots1 = [0];
            // }
            var last_knot = 0;
            pts.forEach((p,i) => {
                if(i < pts.length-1){
                    knots1.push(i);
                    last_knot = i;
                }else{
                    knots1.push(last_knot,last_knot);
                    // if(pts.length < 3) knots1.push(last_knot);
                    // else knots1.push(last_knot,last_knot);
                }
            });
            //knots1.push(knots1.at(-1),knots1.at(-1));
            //var knots2 = [0, 0, 0,   1, 2, 3,   4, 4, 4];
            var knots2 = [0,0];
            pts[0].forEach((p,i) => {
                if(i < pts[0].length-1) knots2.push(i);
            });
            knots2 = knots2.concat([pts[0].length-2, pts[0].length-2]);

            if(d.n[n].c.matrix) pts = pts.map(p=>p.map(p=> p.clone().applyMatrix4(d.n[n].c.matrix))); // does not need to clone ?!?!?!?!
            const surface = new NURBSSurface(degree1, degree2, knots1, knots2, pts);
            surface.get_point = (u, v, target)=>{
                surface.getPoint(u, v, target);
                return target;
            }
            d.n[n].c.surface = surface;
            d.n[n].c.pts = pts;
            // if(d.n[n].ax.matrix){
            //     const ax_surface = new NURBSSurface(degree1, degree2, knots1, knots2, 
            //         pts.map(p=> p.map(p=> p.clone().applyMatrix4(d.n[n].ax.matrix)))
            //     );
            //     ax_surface.get_point = (u, v, target)=>{
            //         ax_surface.getPoint(u, v, target);
            //         return target;
            //     }  
            //     d.n[n].ax.surface = ax_surface;
            // }else{ d.n[n].ax.surface = d.n[n].c.surface; }
            //console.log('reckon surface!!!');
        }}catch(e){
            //delete d.n[n].c.surface;
            //delete d.n[n].ax.surface;
            //console.log(e);
        }
    },
};


//var amt = ((point1.distanceTo(r1[0]) - point1.distanceTo(r1.at(-1))) / endpoint_dist1 + 1) / 2;
                        //var amt = ribs[k].curve.getLengths(this.rib_res)[j] / ribs[k].curve.getLength();
                        //amt = ((point2.distanceTo(r2[0]) - point2.distanceTo(r2.at(-1))) / endpoint_dist2 + 1) / 2;
                        //var amt = ribs[k+1].curve.getLengths(this.rib_res)[j] / ribs[k+1].curve.getLength();



//d.n[n].c.geo = new ParametricGeometry(getSurfacePoint, this.tri_res, this.tri_res);
            //if(d.n[n].c.inner_view) d.n[n].c.geo.index.array.reverse();
            //d.n[n].c.geo.computeVertexNormals();



            // const prfl = ribs[0].pts.reverse().concat(prfl1, ribs.at(-1).pts, prfl2.reverse());
            // for(let i=0; i<ribs.length; i++){
            //     pts = pts.concat(ribs[i].pts);
            // };
            // var geo = new BufferGeometry().setFromPoints(pts);
            // if(d.n[n].c.matrix) geo.applyMatrix4(d.n[n].c.matrix);
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
            // d.n[n].c.geo = geo;



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
            // if(d.n[n].c.matrix) geo2.applyMatrix4(d.n[n].c.matrix);
            // d.n[n].c.geo2 = geo2;


                    
            


            //d.n[n].c.shape = new Shape(pts);
            // console.log(d.n[n].c.shape);

            //console.log(curves);
            //const curve_path = new CurvePath(curves);
            //console.log(curve_path);
            //const points = curve_path.getPoints(this.profile_res);
            //console.log(points);
            //d.n[n].c.shape = new Shape(new CurvePath(curves).getPoints(this.profile_res));

            // var pts = [];
            // var res_h = 0;
            // // sort ribs by Y
            // const ribs = d.n[n].n.mixed_curve.map(n=>{
            //     let pts = d.n[n].w.curve.getPoints();
            //     return {
            //         n: n,
            //         pts: d.n[n].c.pts,
            //         h: d.n[n].c.pts.reduce((a,b)=>a.y+b.y,0),
            //     }
            // }).sort((a,b)=>a.h-b.h);
            // // build pts list for surface
            // for(let i=0; i<ribs.length-1; i++){
            //     pts = pts.concat(ribs[i].pts);
            //     res_h++;
            // };
            // d.n[n].c.pts = pts;
            // d.n[n].c.res_w = d.n[ribs[0].n].c.pts.length-1;
            // d.n[n].c.res_h = res_h-1;
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
//             //const ribs = d.n[n].n.mixed_curve;//.filter(n=> !d.n[n].c.guide);
//             const rail  = d.n[n].n.curve;//.filter(n=>  d.n[n].c.guide);
//             var pts = [];
//             var res_h = 0;
//             // sort ribs by Y
//             const ribs = d.n[n].n.mixed_curve.map(n=>{
//                 let pts = d.n[n].w.curve.getPoints();
//                 return {
//                     n: n,
//                     pts: d.n[n].c.pts,
//                     h: d.n[n].c.pts.reduce((a,b)=>a.y+b.y,0),
//                 }
//             }).sort((a,b)=>a.h-b.h);
//             // build pts list for surface
//             for(let i=0; i<ribs.length-1; i++){
//                 pts = pts.concat(ribs[i].pts);
//                 res_h++;
//             };
//             d.n[n].c.pts = pts;
//             d.n[n].c.res_w = d.n[ribs[0].n].c.pts.length-1;
//             d.n[n].c.res_h = res_h-1;
//             //console.log('reckon surf');
//             //console.log('ribs gds', ribs, rails);
//         }catch(e){console.log(e)}
//     },
// };