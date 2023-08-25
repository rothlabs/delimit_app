import {Vector3, Vector4, MathUtils, CatmullRomCurve3, Box3} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {current} from 'immer';

const v1 = new Vector3();
const v2 = new Vector3();
const bb1 = new Box3();
const bb2 = new Box3();

const mid_res = 500;
const span = 1;
const smooth_span = 6;

export const mixed_curve = { // being recomputed just for ax changes of source curves !!!!!!!!! ?!?!?!?!?!
    node(d, n, c, ax, a={}){ // needs to figure if pos or pos_l results in better match !!!!!!
        try{//if(cause.includes('curve') || cause.includes('matrix') || ['make.edge', 'delete.edge'].includes(cause[0])){ 
            //delete d.n[n].w.curve;

            const l1 = d.n[n].n.curve[0];
            const l2 = d.n[n].n.curve[1];
            //const div = Math.round(((d.n[l1].c.curve.getLength()+d.n[l2].c.curve.getLength())/2)/span);
            //const div1 = Math.round(d.n[l1].c.curve.getLength()/span);
            //const div2 = Math.round(d.n[l2].c.curve.getLength()/span);
            const ptc1 = d.n[l1].c.curve.getPoints(mid_res);
            const ptc2 = d.n[l2].c.curve.getPoints(mid_res);
            if(ptc1[0].z > ptc1.at(-1).z) ptc1.reverse();
            if(ptc2[0].z > ptc2.at(-1).z) ptc2.reverse();
            bb1.setFromArray(ptc1.map(p=>[p.x, p.y, p.z]).flat());
            bb2.setFromArray(ptc2.map(p=>[p.x, p.y, p.z]).flat());
            if(bb1.getSize(v1).x > bb2.getSize(v2).x){
                var pti=ptc1.map((p,i)=>({p:p, v:'xz', i:i})).concat(
                        ptc2.map((p,i)=>({p:p, v:'yz', i:i})));
            }else{
                var pti=ptc2.map((p,i)=>({p:p, v:'xz', i:i})).concat(
                        ptc1.map((p,i)=>({p:p, v:'yz', i:i})));
            }
            if(pti){
                pti.sort((a,b)=> a.p.z-b.p.z);//(a.p.x<b.p.x ? -1 : 1));
                var pto = [];
                // for(var i=0; i<pti.length-1; i+=2){
                //     if(pti[i].v == 'xz' && pti[i+1].v == 'yz'){
                //         pto.push({
                //             p: new Vector3(pti[i].v.x, pti[i+1].v.y, (pti[i].v.z+pti[i+1].v.z)/2), 
                //             i: pti[i].i + pti[i+1].i,
                //         });
                //     }else if(pti[i+1].v == 'xz' && pti[i].v == 'yz'){
                //         pto.push({
                //             p: new Vector3(pti[i+1].v.x, pti[i].v.y, (pti[i].v.z+pti[i+1].v.z)/2), 
                //             i: pti[i].i + pti[i+1].i,
                //         });
                //     }
                // }
                
                var oxi = 0; 
                var oyi = 0;
                var xi = -1; // zi
                var yi = -1;
                for(var i=0; i<pti.length; i++){
                    if(pti[i].v == 'xz'){ var x = pti[i].p.x; xi=i; 
                    }else{ var y = pti[i].p.y; yi=i; }
                    if(xi>-1 && yi>-1) break;
                }
                for(var i=0; i<pti.length; i++){ // interpolate x and y here ?!?!?!?!
                    if(pti[i].v == 'xz'){
                        x = pti[i].p.x;
                        oxi = pti[i].i;
                        // for(let k=xi+1; k<i; k++){
                        //     let amt = (k-xi)/(i-xi);
                        //     pto[k].p.setX((1-amt)*pto[xi].p.x+amt*x);
                        //     //pto[k].oxi = (1-amt)*pto[yi].oxi + amt*oxi;
                        // }
                        //pto.push(new Vector3(x, y, pti[i].p.z));
                        pto.push({
                            p: new Vector3(x, y, pti[i].p.z), 
                            oxi: oxi,
                            oyi: oyi,
                        });
                        xi = i;
                    }else{
                        y = pti[i].p.y;
                        oyi = pti[i].i;
                        // for(let k=yi+1; k<i; k++){
                        //     let amt = (k-yi)/(i-yi);
                        //     pto[k].p.setY((1-amt)*pto[yi].p.y+amt*y);
                        //     //pto[k].oyi = (1-amt)*pto[yi].oyi + amt*oyi;
                        // }
                        //pto.push(new Vector3(x, y, pti[i].p.z));
                        pto.push({
                            p: new Vector3(x, y, pti[i].p.z), 
                            oxi: oxi,
                            oyi: oyi,
                        });
                        yi=i;
                    }
                }
                pto = pto.sort((a,b)=> (a.oxi+a.oyi) - (b.oxi+b.oyi)).map(p=> p.p);
                pto.shift();
                

                var [pts, curve] = d.geo.smooth_catmullrom(d, pto, smooth_span);//var pts = pto;

                c.mixed_curve = curve;//c.mixed_curve = new CatmullRomCurve3(pts);
                c.curve = c.mixed_curve;
                if(c.matrix){
                    pts = pts.map(p=> p.clone().applyMatrix4(c.matrix));
                    c.curve = new CatmullRomCurve3(pts);
                }
                ax.curve = c.curve;
                if(ax.matrix) ax.curve = new CatmullRomCurve3(pts.map(p=>p.clone().applyMatrix4(ax.matrix)));
            }
            //console.log('Reckon mixed curve!!!');
        }catch(e){
            delete c.curve;
            delete ax.curve;
            //console.log(e);
        }
    },
};


// if(c.matrix){
//     const special = c.mixed_curve.clone();
//     special.get_points = (div)=>{
//         return special.getPoints(div).map(p=> p.applyMatrix4(c.matrix));
//     };
//     c.curve = special;
//     //pts = pts.map(p=> p.clone().applyMatrix4(c.matrix));
// }else{
//     c.curve = c.mixed_curve;
// }
// if(ax.matrix){
//     ax.curve = c.curve.clone();
//     ax.curve.get_points = (div)=>{
//         return c.curve.get_points(div).map(p=> p.applyMatrix4(ax.matrix));
//     };
//     //ax.curve = new CatmullRomCurve3(pts.map(p=>p.clone().applyMatrix4(ax.matrix)));
// }else{
//     ax.curve = c.curve;
// }


                ///pto.push(last_point);

                //console.log(pto);

                // var pto2 = [pto[0]];
                // const cmp = pto.slice(1,10);
                // for(var i=0; i<pto.length-1; i++){
                //     cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                //     if(cmp[0].distanceTo(pto2.at(-1)) < pto[i+1].distanceTo(pto2.at(-1))){
                //         pto2.push(cmp.shift());
                //         cmp.push(pto[i+1]);
                //     }else{ pto2.push(pto[i+1]) }
                //     if(i<pto.length-10) cmp.push(pto[i+10]);
                // }
                // while(cmp.length > 1){ // simplify continuity check to just this loop ?!?!?!?!
                //     cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                //     if(pto.at(-1).distanceTo(pto2.at(-1)) < cmp[0].distanceTo(pto2.at(-1))) break;
                //     pto2.push(cmp.shift());
                // }
                // pto2[pto2.length-1] = pto.at(-1);
                //pto2 = pto2.map(p=> p.clone());



// const l1 = d.n[n].n.curve[0];
// const l2 = d.n[n].n.curve[1];
// const ptc1 = d.n[l1].c.curve.getPoints(mid_res);
// const ptc2 = d.n[l2].c.curve.getPoints(mid_res);
// bb1.setFromArray(ptc1.map(p=>[p.x, p.y, p.z]).flat());
// bb2.setFromArray(ptc2.map(p=>[p.x, p.y, p.z]).flat());
// if(bb1.getSize(v1).x > bb2.getSize(v2).x){
//     var pti=ptc1.map(p=>({p:p,v:'xz'})).concat(
//             ptc2.map(p=>({p:p,v:'yz'})));
// }else{
//     var pti=ptc2.map(p=>({p:p,v:'xz'})).concat(
//             ptc1.map(p=>({p:p,v:'yz'})));
// }
// if(pti){
//     var pto = [];
//     pti.sort((a,b)=> a.p.z-b.p.z);//(a.p.x<b.p.x ? -1 : 1));
//     var xi = -1; // zi
//     var yi = -1;
//     for(var i=0; i<pti.length; i++){
//         if(pti[i].v == 'xz'){ var x = pti[i].p.x; xi=i; 
//         }else{ var y = pti[i].p.y; yi=i; }
//         if(xi>-1 && yi>-1) break;
//     }
//     for(var i=0; i<pti.length; i++){ // interpolate x and y here ?!?!?!?!
//         if(pti[i].v == 'xz'){
//             x = pti[i].p.x;
//             for(let k=xi+1; k<i; k++){
//                 let amt = (k-xi)/(i-xi);
//                 pto[k].setX((1-amt)*pto[xi].x+amt*x);
//             }
//             pto.push(new Vector3(x, y, pti[i].p.z));
//             xi=i;
//         }else{
//             y = pti[i].p.y;
//             for(let k=yi+1; k<i; k++){
//                 let amt = (k-yi)/(i-yi);
//                 pto[k].setY((1-amt)*pto[yi].y+amt*y);
//             }
//             pto.push(new Vector3(x, y, pti[i].p.z));
//             yi=i;
//         }
//     }
//     var pto2 = [pto[0]];
//     const cmp = pto.slice(1,10);
//     for(var i=0; i<pto.length-1; i++){
//         cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
//         if(cmp[0].distanceTo(pto2.at(-1)) < pto[i+1].distanceTo(pto2.at(-1))){
//             pto2.push(cmp.shift());
//             cmp.push(pto[i+1]);
//         }else{ pto2.push(pto[i+1]) }
//         if(i<pto.length-10) cmp.push(pto[i+10]);
//     }
//     while(cmp.length > 1){ // simplify continuity check to just this loop ?!?!?!?!
//         cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
//         if(pto.at(-1).distanceTo(pto2.at(-1)) < cmp[0].distanceTo(pto2.at(-1))) break;
//         pto2.push(cmp.shift());
//     }
//     pto2[pto2.length-1] = pto.at(-1);
//     //pto2 = pto2.map(p=> p.clone());
//     c.mixed_curve = new CatmullRomCurve3(pto2);
//     if(c.matrix){
//         pto2 = pto2.map(p=> p.clone().applyMatrix4(c.matrix));
//         c.curve = new CatmullRomCurve3(pto2);
//     }else{
//         c.curve = c.mixed_curve;
//     }
//     if(ax.matrix) ax.curve = new CatmullRomCurve3(pto2.map(p=>p.clone().applyMatrix4(ax.matrix)));
//     else ax.curve = c.curve;









//if(c.matrix) pto2 = pto2.map(p=>p.clone().applyMatrix4(c.matrix));

// c.pts = new CatmullRomCurve3(pto2).getPoints(this.res);
// if(c.matrix) c.pts = c.pts.map(p=>p.applyMatrix4(c.matrix)); 

// if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }