import {current} from 'immer';
import {Vector3, Shape, CurvePath} from 'three';
//import Delaunator from 'delaunator';
//import { closest } from '../../junk/vertex.js';

const v1 = new Vector3();
const v2 = new Vector3();
//const v3 = new Vector3();
//const v4 = new Vector3();
//const v5 = new Vector3();
//const v6 = new Vector3();

export const shape = {
    shape_calc_res: 100,
    shape_max_dist: 1,
    shape(d,n,cause=[]){ 
        try{
            const bndry  = d.n[n].n.curve.map(n=>({
                used: false,
                pts: d.n[n].c.curve.getPoints(this.shape_calc_res),
                //ax_pts: d.n[n].ax.curve.getPoints(this.shape_calc_res),
            }));
            var pts = [...bndry[0].pts];
            //var ax_pts = [...bndry[0].ax_pts];
            bndry[0].used = true;
            var i = 1;
            while(i < bndry.length){
                if(!bndry[i].used){
                    if(pts.at(-1).distanceTo(bndry[i].pts[0]) < this.shape_max_dist) {
                        bndry[i].used = true;
                        pts = pts.concat(bndry[i].pts); 
                        //ax_pts = ax_pts.concat(bndry[i].ax_pts); 
                        i = 0;
                    }else if(pts.at(-1).distanceTo(bndry[i].pts.at(-1)) < this.shape_max_dist){
                        bndry[i].used = true;
                        pts = pts.concat(bndry[i].pts.reverse());
                        //ax_pts = ax_pts.concat(bndry[i].ax_pts.reverse());
                        i = 0;
                    }
                }
                i++;
            }
            d.n[n].c.shape = new Shape(pts);
        }catch(e){
            delete d.n[n].c.shape;
            delete d.n[n].ax.shape;
            //console.log(e);
        }
    },
};

//if(d.n[n].c.matrix) pts = pts.map(p=> p.clone().applyMatrix4(d.n[n].c.matrix));
//d.n[n].ax.shape = new Shape(ax_pts);
            //if(d.n[n].ax.matrix) d.n[n].ax.shape = new Shape(pts.map(p=> p.clone().applyMatrix4(d.n[n].ax.matrix)));
            //else d.n[n].ax.shape = d.n[n].c.shape;
            //console.log('made shape!!!');

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