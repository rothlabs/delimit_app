import {Vector4, MathUtils} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';

const degree = 2;
const add_pnt = (knots, div, ctrl_pnts, pnt, i)=>{
    const knot = ( i + 1 ) / div;
    knots.push(MathUtils.clamp( knot, 0, 1 ));
    ctrl_pnts.push(new Vector4(pnt.x, pnt.y, pnt.z, 1));
}

const n = {};
n.source = ['point'];//, 'curve'];
n.part = (d, s, c)=>{
    //if(s.point.length < 3) return;
    const knots = new Array(degree+1).fill(0);
    const div = (s.point.length - degree);
    const ctrl_pnts = [];
    s.point.map((pnt,i)=> add_pnt(knots, div, ctrl_pnts, pnt.p, i)); // try currying here
    const curve = new NURBSCurve(degree, knots, ctrl_pnts);
    return d.part.curve(curve);
};
export const curve = n;


//curve.design = (d, s, c)=>{
    
//};



// const wrap = (curve)=>({
//     points:(cnt) => curve.getPoints(cnt),
// });
//wrap(curve);

// import {current} from 'immer';


// const v1 = new Vector3();
// const v2 = new Vector3();
// const bb1 = new Box3();
// const bb2 = new Box3();

//     //res: 100,
//     node(d, n, c, ax, a={}){
//         //c.pts = [];
//         try{

//             if(d.n[n].n.point?.length > 1){ 
//                 //d.n[n].w.curve = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].w.pos));
//                 //d.n[n].l.curve = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].l.pos));
//                 const pts = d.n[n].n.point.map(n=>d.n[n].c.pos);    // rename so this is pos_a ?!?!?! (absolute or g for global)
//                 c.pts = pts;
//                 const ax_pts = d.n[n].n.point.map(n=>d.n[n].ax.pos); // rename so this is pos ?!?!?!?!
//                 ax.pts = ax_pts;
//                 // var knots = [0,0];
//                 // var last_knot = 0;
//                 // pts.forEach((p,i) => {
//                 //     if(i < pts.length-1){
//                 //         knots.push(i);
//                 //         last_knot = i;
//                 //     }else{knots.push(last_knot,last_knot)}
//                 // });


//                 const cp = [];
//                 const ax_cp = [];
//                 const knots = [];
//                 for (let i=0; i<=degree; i++) knots.push(0);
//                 for(let i=0; i < pts.length; i++) {
//                     cp.push(new Vector4(pts[i].x, pts[i].y, pts[i].z, 1));
//                     ax_cp.push(new Vector4(ax_pts[i].x, ax_pts[i].y, ax_pts[i].z, 1));
//                     const knot = ( i + 1 ) / (pts.length - degree);
// 				    knots.push( MathUtils.clamp( knot, 0, 1 ) );
//                 }
// 				// for(let i=1; i < pts.length-1; i++) {
//                 //     knots.push(knots.at(-1) + pts[i].distanceTo(pts[i-1]));

// 				// }
//                 // knots.push(knots.at(-1),knots.at(-1));
//                 //console.log(knots);
//                 c.curve = new NURBSCurve(degree, knots, cp);//, 2, knots.length-2);
//                 ax.curve = new NURBSCurve(degree, knots, ax_cp);//, 2, knots.length-2);
//                 c.curve.getPoints(3); // checking if valid curve 
                


//                 //console.log('CURVE COMPLETE');
//             //}else{
//             //    delete d.n[n].w.curve;
//             //    delete d.n[n].l.curve;
//             }
//             //c.pts = d.n[n].w.curve.getPoints(this.res);
//         }catch(e){
//             delete c.curve;
//             delete ax.curve;
//             //console.log('CURVE ERROR',e);
//         } // make switch so easy to view reckon errors for different types of nodes ?!?!?!?!
//     }, 
// };







// const cp = [];
// const ax_cp = [];
// const knots = [];
// for (let i=0; i<=degree; i++) knots.push(0);
// for(let i=0; i < pts.length; i++) {
//     cp.push(new Vector4(pts[i].x, pts[i].y, pts[i].z, 1));
//     ax_cp.push(new Vector4(ax_pts[i].x, ax_pts[i].y, ax_pts[i].z, 1));
//     const knot = ( i + 1 ) / (pts.length - degree);
//     knots.push( MathUtils.clamp( knot, 0, 1 ) );
// }
// //knots.push(1);
// //console.log(knots);
// c.curve = new NURBSCurve(degree, knots, cp);//, 2, knots.length-2);
// ax.curve = new NURBSCurve(degree, knots, ax_cp);//, 2, knots.length-2);
// c.curve.getPoints(3); // checking if valid curve 


//if(c.matrix) pto2 = pto2.map(p=>p.clone().applyMatrix4(c.matrix));

// c.pts = new CatmullRomCurve3(pto2).getPoints(this.res);
// if(c.matrix) c.pts = c.pts.map(p=>p.applyMatrix4(c.matrix)); 

// if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'c'})));
// }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'c'})));
// }