import {Vector3, CatmullRomCurve3, Shape, CurvePath} from 'three';
import {current} from 'immer';
export const surface = {
    boundary_res: 100,
    max_dist: 40,
    //res_w: 100,//d.reckon.curve.res,
    res_h: 10,
    surface(d,n,cause=''){ // need indicator on how to order ribs ?!?!?!?! (ordering by y right now)
        try{//if(cause.includes('curve') || ['make.edge', 'delete.edge'].includes(cause)){ 
            //const ribs = d.n[n].n.mixed_curve;//.filter(n=> !d.n[n].c.guide);
            const ribs = d.n[n].n.mixed_curve.map(n=>{
                //let pts = d.n[n].c.curve.getPoints();
                return {
                    used:false,
                    n: n,
                    pts: d.n[n].c.curve.getPoints(this.boundary_res),
                    h: d.n[n].c.curve.getPoints(4).reduce((a,b)=>a.y+b.y,0),
                }
            }).sort((a,b)=>a.h-b.h);
            function transform_points(pts){
                if(d.n[ribs[0].n].c.matrix) return pts.map(p=>p.applyMatrix4(d.n[ribs[0].n].c.matrix));
                return pts;
            }
            const bndry  = d.n[n].n.curve.map(n=>({
                used:false,
                pts:transform_points(d.n[n].c.curve_l.getPoints(this.boundary_res)),
            }));
            var pts = [...bndry[0].pts];
            bndry[0].used = true;
            var i = 1;
            const curves = [...bndry, ribs[0], ribs.at(-1)];
            while(i < curves.length){
                if(!curves[i].used){
                    if(pts.at(-1).distanceTo(curves[i].pts[0]) < this.max_dist) {
                        curves[i].used = true;
                        pts = pts.concat(curves[i].pts); 
                        i = 0;
                    }else if(pts.at(-1).distanceTo(curves[i].pts.at(-1)) < this.max_dist){
                        curves[i].used = true;
                        pts = pts.concat(curves[i].pts.reverse());
                        i = 0;
                    }
                }
                i++;
            }
            //console.log(pts);
            d.n[n].c.shape = new Shape(pts);
            console.log(d.n[n].c.shape);
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
            //     let pts = d.n[n].c.curve.getPoints();
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
        }catch(e){console.log(e)}
    },
};


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
//                 let pts = d.n[n].c.curve.getPoints();
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