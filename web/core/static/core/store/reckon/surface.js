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
    guide_res: 60,
    boundary_res: 60,
    //sub_res: 30,
    sub_div: 12,
    //tri_res: 80,
    //max_dist: 40,
    //res_w: 100,//d.reckon.curve.res,
    //res_h: 10,
    surface(d,n,cause=[]){ // need indicator on how to order ribs ?!?!?!?! (ordering by y right now)
        try{//if(cause.includes('curve') || ['make.edge', 'delete.edge'].includes(cause)){ 
            

            

            //var pts = [];
            const ribs = d.n[n].n.mixed_curve.map(n=>{
                const points = d.n[n].c.curve.getPoints(this.rib_res-1); //getSpacedPoints
                if(points[0].x > points.at(-1).x) points.reverse();
                //pts.push(points.map(p=>new Vector4(p.x, p.y, p.z, 1)));
                //pts.push(points);
                //console.log('reducer?',points.reduce((a,b)=>a+b.y,0));
                return {
                    //used:false,
                    //matrix: d.n[n].c.matrix,
                    pts: points,
                    //curve: new CatmullRomCurve3(pts),
                    y: d.n[n].c.curve.getPoints(9).reduce((a,b)=>a+b.y,0)/10, // returning NaN ?!?!?!?!
                }
            }).sort((a,b)=>a.y-b.y);
            const guide = d.n[n].n.curve.map(n=>{//.filter(n=> d.n[n].c.guide).map(n=>{
                const pts = d.n[n].c.curve.getPoints(this.guide_res);
                if(pts[0].y > pts.at(-1).y) pts.reverse();
                return {
                    pts: pts,
                    sub: [], // sub points between ribs
                    x: d.n[n].c.curve.getPoints(9).reduce((a,b)=>a+b.x,0)/10,
                }
            }).sort((a,b)=>a.x-b.x);
            var idx1 = 0;
            var idx2 = 0;
            for(let i=1; i<ribs.length; i++){
                const sub_div = Math.round((ribs[i].y - ribs[i-1].y) / (ribs.at(-1).y - ribs[0].y) * (this.sub_div+1));

                var closest = guide[0].pts.slice().sort((a,b)=> a.distanceTo(ribs[i].pts[0])-b.distanceTo(ribs[i].pts[0]))[0];
                var idx = guide[0].pts.indexOf(closest);
                //pts = pts.concat(new CatmullRomCurve3(guide[0].pts.slice(idx1,idx)).getSpacedPoints(this.sub_div+1));
                //console.log('before error', closest, idx);
                guide[0].sub.push(new CatmullRomCurve3(guide[0].pts.slice(idx1,idx)).getPoints(sub_div)); 
                idx1 = idx;
                closest = guide[1].pts.slice().sort((a,b)=> a.distanceTo(ribs[i].pts.at(-1))-b.distanceTo(ribs[i].pts.at(-1)))[0];
                idx = guide[1].pts.indexOf(closest);
                //pts = pts.concat(new CatmullRomCurve3(guide[1].pts.slice(idx2,idx)).getSpacedPoints(this.sub_div+1));
                guide[1].sub.push(new CatmullRomCurve3(guide[1].pts.slice(idx2,idx)).getPoints(sub_div));
                idx2 = idx;
            }
            


            // make extra ribs in between existing ribs
            var pts = [];
            
            const prfl1 = [];
            const prfl2 = [];
            //d.n[n].c.pts = [];
            pts.push(ribs[0].pts);
            //var first_knots = ribs[0].pts.reduce((a,b)=>a+b.y,0);
            //console.log('first_knots',first_knots);
            //var knots1 = [first_knots,first_knots,first_knots];
            //knots1.push(ribs[0].pts.reduce((a,b)=>a.y+b.y,0));
            for(let k=0; k<ribs.length-1; k++){
                var r1 = ribs[k].pts;
                var r2 = ribs[k+1].pts;
                var g1 = guide[0].sub[k];
                var g2 = guide[1].sub[k];
                
                //prfl1.push(r1[0]);
                //prfl2.push(r1.at(-1));
                for(let i=1; i<g1.length-1; i++){
                    var a1 = v1.set(r1[0].x,r1[0].y,0).distanceTo(g1[i]) / v1.set(r1[0].x,r1[0].y,0).distanceTo(v2.set(r2[0].x,r2[0].y,0));
                    var a2 = v1.set(r1.at(-1).x,r1.at(-1).y,0).distanceTo(g2[i]) / v1.set(r1.at(-1).x,r1.at(-1).y,0).distanceTo(v2.set(r2.at(-1).x,r2.at(-1).y,0));
                    const endpoint1 = new Vector3(g1[i].x, g1[i].y, r1[0].z*(1-a1) + r2[0].z*a1);
                    const endpoint2 = new Vector3(g2[i].x, g2[i].y, r1.at(-1).z*(1-a2) + r2.at(-1).z*a2);
                    //d.n[n].c.pts.push(endpoint1.clone().applyMatrix4(d.n[n].c.matrix));
                    //d.n[n].c.pts.push(endpoint2.clone().applyMatrix4(d.n[n].c.matrix));

                    //pts.push(endpoint1);
                    //pts.push(endpoint2);
                    //prfl1.push(endpoint1);
                    //prfl2.push(endpoint2);

                    //if(i%2 == 0) continue;

                    const delta1 = endpoint1.clone().sub(r1[0]);
	                const delta2 = endpoint2.clone().sub(r1.at(-1));
                    const delta3 = endpoint1.clone().sub(r2[0]); // don't need to clone here ?!?!?!?
	                const delta4 = endpoint2.clone().sub(r2.at(-1)); // don't need to clone here ?!?!?!
	                //const endpoint_dist1 = r1[0].distanceTo(r1.at(-1));
                    //const endpoint_dist2 = r2[0].distanceTo(r2.at(-1));
                    
                    const new_rib = []
                    for (let j=0; j < r1.length; j++) { // change to rib_res ?!?!?!
                        var amt = j/r1.length;
                        var point1 = r1[j].clone();
                        //var amt = ((point1.distanceTo(r1[0]) - point1.distanceTo(r1.at(-1))) / endpoint_dist1 + 1) / 2;
                        //var amt = ribs[k].curve.getLengths(this.rib_res)[j] / ribs[k].curve.getLength();
                        var np1 = point1.add(delta1.clone().multiplyScalar(1-amt)).add(delta2.clone().multiplyScalar(amt));
                        //d.n[n].c.pts.push(np.clone().applyMatrix4(d.n[n].c.matrix));
                        //nr.push(np);

                        var point2 = r2[j].clone();
                        //amt = ((point2.distanceTo(r2[0]) - point2.distanceTo(r2.at(-1))) / endpoint_dist2 + 1) / 2;
                        //var amt = ribs[k+1].curve.getLengths(this.rib_res)[j] / ribs[k+1].curve.getLength();
                        
                        var np2 = point2.add(delta3.clone().multiplyScalar(1-amt)).add(delta4.clone().multiplyScalar(amt));
                        
                        amt = i/(g1.length-1);
                        var np  = np1.multiplyScalar(1-amt).add(np2.multiplyScalar(amt));

                        //d.n[n].c.pts.push(np.clone().applyMatrix4(d.n[n].c.matrix));
                        new_rib.push(np);
                        if(j==0) prfl1.push(np);
                        if(j==r1.length-1) prfl2.push(np);
                    }
                    pts.push(new_rib);
                    //knots1.push(new_rib.reduce((a,b)=>a+b.y,0));
                    
                    //knots1.push(r2.reduce((a,b)=>a+b.y,0));
                    

                    //var nr = [];
                    //for(let k=0; i<this.rib_res; i++){

                    //}
                }
                pts.push(r2);
                //prfl1.push(r2[0]);
                //prfl2.push(r2.at(-1));
            }


            if(d.n[n].c.matrix) pts = pts.map(p=> p.map(p=>p.clone().applyMatrix4(d.n[n].c.matrix)));
            var degree1 = 2;
            var degree2 = 2;
            //var knots1 = [0, 0, 0, 1, 1, 1];
            var knots1 = [0,0];
            var last_knot = 0;
            pts.forEach((p,i) => {
                if(i < pts.length-1){
                    knots1.push(i);
                    last_knot = i;
                }else{knots1.push(last_knot,last_knot)}
            });
            //knots1.push(knots1.at(-1),knots1.at(-1));
            //var knots2 = [0, 0, 0,   1, 2, 3,   4, 4, 4];
            var knots2 = [0,0];
            pts[0].forEach((p,i) => {
                if(i < pts[0].length-1) knots2.push(i);
            });
            knots2 = knots2.concat([pts[0].length-2, pts[0].length-2]);
            //console.log('knots1', knots1);
            //console.log('knots2', knots2);
            const surface = new NURBSSurface(degree1, degree2, knots1, knots2, pts);
            surface.get_point = (u, v, target)=>{
                surface.getPoint(u, v, target);
                // override point here
                return target;
            }
            d.n[n].c.surface = surface;
            d.n[n].c.pts = pts;
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
        }catch(e){
            delete d.n[n].c.geo;
            //console.log(e);
        }
    },
};



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